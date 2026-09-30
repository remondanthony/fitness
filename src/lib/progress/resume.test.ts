import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  hoursSince,
  isResumable,
  pickResumable,
  RESUME_WINDOW_HOURS,
  resumeCutoff,
  type ResumeCandidate,
} from "./resume.ts";

/**
 * Resume eligibility.
 *
 *   node --experimental-strip-types --test src/lib/progress/resume.test.ts
 *
 * The clock is injected everywhere, so none of these depend on when they run.
 *
 * Documented boundary rule: the window is STRICT. A session started exactly
 * RESUME_WINDOW_HOURS ago is NOT eligible. "Within the last 48 hours" is read
 * as an open interval at the far edge.
 */

const NOW = new Date("2026-09-29T12:00:00.000Z");
const HOUR = 60 * 60 * 1000;

/** A session started `hoursAgo` before NOW. */
function ago(hoursAgo: number): string {
  return new Date(NOW.getTime() - hoursAgo * HOUR).toISOString();
}

function candidate(over: Partial<ResumeCandidate> & { id: string }): ResumeCandidate {
  return { workoutSlug: "upper-body-power", startedAt: ago(2), ...over };
}

describe("the window itself", () => {
  it("is 48 hours", () => {
    assert.equal(RESUME_WINDOW_HOURS, 48);
  });

  it("computes a cutoff the query and the check can share", () => {
    assert.equal(resumeCutoff(NOW), "2026-09-27T12:00:00.000Z");
  });
});

describe("isResumable", () => {
  it("accepts a session 47h59m old", () => {
    assert.equal(isResumable(ago(47 + 59 / 60), NOW), true);
  });

  it("rejects a session exactly 48h old — the boundary is strict", () => {
    assert.equal(isResumable(ago(48), NOW), false);
  });

  it("accepts a session a minute inside the boundary", () => {
    assert.equal(isResumable(ago(48 - 1 / 60), NOW), true);
  });

  it("rejects a session older than 48h", () => {
    assert.equal(isResumable(ago(49), NOW), false);
    assert.equal(isResumable(ago(24 * 30), NOW), false);
  });

  it("accepts a session started moments ago", () => {
    assert.equal(isResumable(ago(0), NOW), true);
  });

  it("accepts a session stamped slightly in the future", () => {
    // Clock skew between the database and the app, not a stale session.
    assert.equal(isResumable(new Date(NOW.getTime() + 5 * 60_000).toISOString(), NOW), true);
  });

  it("rejects an unreadable timestamp rather than guessing", () => {
    assert.equal(isResumable("not-a-date", NOW), false);
    assert.equal(isResumable("", NOW), false);
  });
});

describe("pickResumable", () => {
  it("returns null when there is no unfinished session", () => {
    assert.equal(pickResumable([], NOW), null);
  });

  it("selects the only eligible session", () => {
    const only = candidate({ id: "a", startedAt: ago(3) });
    assert.equal(pickResumable([only], NOW)?.id, "a");
  });

  it("selects the newest when several are eligible", () => {
    const picked = pickResumable(
      [
        candidate({ id: "old", startedAt: ago(30) }),
        candidate({ id: "newest", startedAt: ago(1) }),
        candidate({ id: "middle", startedAt: ago(10) }),
      ],
      NOW,
    );

    assert.equal(picked?.id, "newest");
  });

  it("ignores stale sessions entirely", () => {
    assert.equal(pickResumable([candidate({ id: "stale", startedAt: ago(72) })], NOW), null);
  });

  it("picks an eligible session even when a newer row is stale", () => {
    // Impossible from the query's DESC ordering — older rows are older still —
    // but a corrupt or future-stamped row must not hide a real session, so the
    // scan looks for the newest ELIGIBLE row rather than trusting the head.
    const picked = pickResumable(
      [
        candidate({ id: "unreadable", startedAt: "garbage" }),
        candidate({ id: "eligible", startedAt: ago(5) }),
        candidate({ id: "ancient", startedAt: ago(200) }),
      ],
      NOW,
    );

    assert.equal(picked?.id, "eligible");
  });

  it("skips a candidate with no workout slug", () => {
    // Without a slug there is no catalogue entry and no route to resume to.
    assert.equal(
      pickResumable([candidate({ id: "a", workoutSlug: "", startedAt: ago(1) })], NOW),
      null,
    );
  });

  it("breaks a tie deterministically on id", () => {
    const shared = ago(2);
    const rows = [
      candidate({ id: "bbb", startedAt: shared }),
      candidate({ id: "aaa", startedAt: shared }),
    ];

    assert.equal(pickResumable(rows, NOW)?.id, "aaa");
    assert.equal(pickResumable([...rows].reverse(), NOW)?.id, "aaa");
  });

  it("gives the same answer whatever order the rows arrive in", () => {
    const rows = [
      candidate({ id: "a", startedAt: ago(20) }),
      candidate({ id: "b", startedAt: ago(2) }),
      candidate({ id: "c", startedAt: ago(9) }),
    ];

    assert.equal(pickResumable(rows, NOW)?.id, pickResumable([...rows].reverse(), NOW)?.id);
  });

  it("carries the whole row through, not a copy", () => {
    const only = { ...candidate({ id: "a" }), extra: "kept" };
    assert.equal(pickResumable([only], NOW)?.extra, "kept");
  });
});

describe("completed sessions are never candidates", () => {
  it("is enforced by the query, not by this module", () => {
    // `getOpenSessionAny` filters `completed = false` and `completed_at is
    // null` before anything reaches here, so a finished session is never a
    // candidate. What this module guarantees is that it invents none: given no
    // candidates, it returns null rather than falling back to anything.
    assert.equal(pickResumable([], NOW), null);
  });
});

describe("hoursSince", () => {
  it("floors to whole hours", () => {
    assert.equal(hoursSince(ago(3.9), NOW), 3);
    assert.equal(hoursSince(ago(1), NOW), 1);
  });

  it("is zero for a session started moments ago", () => {
    assert.equal(hoursSince(ago(0.2), NOW), 0);
  });

  it("never goes negative for a future timestamp", () => {
    assert.equal(hoursSince(new Date(NOW.getTime() + HOUR).toISOString(), NOW), 0);
  });

  it("returns null for an unreadable timestamp", () => {
    assert.equal(hoursSince("nope", NOW), null);
  });
});

describe("ownership is not this module's concern — and cannot be influenced here", () => {
  it("exposes no user field to filter on", () => {
    const picked = pickResumable([candidate({ id: "a" })], NOW);

    for (const forbidden of ["userId", "user_id", "uid"]) {
      assert.equal(forbidden in (picked ?? {}), false, forbidden);
    }
  });
});
