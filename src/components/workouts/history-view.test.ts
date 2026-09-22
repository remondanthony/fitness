import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatDuration,
  formatSessionTimestamp,
  toHistoryItem,
  type HistoryItem,
} from "./history-view.ts";
import { summariseSessions } from "../../lib/progress/aggregate.ts";
import type { SessionVolume } from "../../lib/progress/aggregate.ts";

/**
 * Workout history rows.
 *
 *   node --experimental-strip-types --test src/components/workouts/history-view.test.ts
 *
 * The volume arithmetic is already pinned down by lib/progress/aggregate.test.ts
 * and is not re-tested here. What these cover is the row: what it says when the
 * data is incomplete, and that nothing is invented to fill a gap.
 */

/** A session as the data layer returns it, built through the real aggregation. */
function session(
  over: Partial<{
    id: string;
    workoutSlug: string;
    durationSeconds: number | null;
    logs: { weight: number | null; reps: number | null }[];
  }> = {},
): SessionVolume {
  const [result] = summariseSessions([
    {
      id: over.id ?? "s1",
      workoutSlug: over.workoutSlug ?? "upper-body-power",
      startedAt: "2026-09-20T09:00:00Z",
      completedAt: "2026-09-20T10:02:00Z",
      durationSeconds: over.durationSeconds === undefined ? 3720 : over.durationSeconds,
      logs: over.logs ?? [{ weight: 60, reps: 8 }],
    },
  ]);
  return result;
}

describe("formatDuration", () => {
  it("shows whole minutes below an hour", () => {
    assert.equal(formatDuration(2700), "45 min");
    assert.equal(formatDuration(60), "1 min");
  });

  it("shows hours and padded minutes at an hour or more", () => {
    assert.equal(formatDuration(3720), "1h 02m");
    assert.equal(formatDuration(3600), "1h 00m");
    assert.equal(formatDuration(7830), "2h 11m");
  });

  it("rounds to at least a minute rather than showing zero", () => {
    assert.equal(formatDuration(20), "1 min");
  });

  it("shows a dash when no duration was stored — never 0 min", () => {
    // A session logged without a duration is not a zero-minute session.
    assert.equal(formatDuration(null), "—");
    assert.equal(formatDuration(0), "—");
  });

  it("shows a dash for values that are not finite", () => {
    assert.equal(formatDuration(Number.NaN), "—");
    assert.equal(formatDuration(Number.POSITIVE_INFINITY), "—");
    assert.equal(formatDuration(-60), "—");
  });
});

describe("formatSessionTimestamp", () => {
  it("formats date and time in UTC", () => {
    assert.equal(formatSessionTimestamp("2026-09-20T10:02:00Z"), "20 Sep 2026 · 10:02");
    assert.equal(formatSessionTimestamp("2026-01-05T07:05:00Z"), "5 Jan 2026 · 07:05");
  });

  it("pads single-digit hours and minutes", () => {
    assert.equal(formatSessionTimestamp("2026-09-20T09:05:00Z"), "20 Sep 2026 · 09:05");
    assert.equal(formatSessionTimestamp("2026-09-20T00:00:00Z"), "20 Sep 2026 · 00:00");
  });

  it("reads in UTC, not local time, across midnight", () => {
    // 23:30Z is already the next day at +02:00. UTC decides, matching the
    // boundary the rest of the progress system uses.
    assert.equal(formatSessionTimestamp("2026-09-20T23:30:00Z"), "20 Sep 2026 · 23:30");
  });

  it("returns an empty label rather than throwing on a bad timestamp", () => {
    assert.equal(formatSessionTimestamp("nonsense"), "");
  });
});

describe("toHistoryItem", () => {
  it("builds a row from a catalogue workout", () => {
    const item = toHistoryItem(session(), "Upper Body Power");

    assert.equal(item.name, "Upper Body Power");
    assert.equal(item.unknownWorkout, false);
    assert.equal(item.completedLabel, "20 Sep 2026 · 10:02");
    assert.equal(item.durationLabel, "1h 02m");
    assert.equal(item.sets, 1);
    assert.equal(item.volumeLabel, "480 kg");
  });

  it("keeps a session whose workout has left the catalogue, showing the slug", () => {
    // Dropping the row would quietly delete something the member actually did.
    const item = toHistoryItem(session({ workoutSlug: "retired-workout" }), null);

    assert.equal(item.name, "retired-workout");
    assert.equal(item.unknownWorkout, true);
    assert.equal(item.volumeLabel, "480 kg");
  });

  it("counts a null-weight set as a set but leaves it out of the volume", () => {
    const item = toHistoryItem(
      session({
        logs: [
          { weight: 50, reps: 10 },
          { weight: null, reps: 10 },
        ],
      }),
      "Upper Body Power",
    );

    assert.equal(item.sets, 2);
    assert.equal(item.unmeasuredSets, 1);
    assert.equal(item.volume, 500);
  });

  it("treats a bodyweight set as a real set contributing zero", () => {
    const item = toHistoryItem(
      session({ logs: [{ weight: 0, reps: 20 }] }),
      "Upper Body Power",
    );

    assert.equal(item.sets, 1);
    assert.equal(item.unmeasuredSets, 0);
    assert.equal(item.volume, 0);
    assert.equal(item.volumeLabel, "0 kg");
  });

  it("shows zero sets and zero volume for a session with no logs", () => {
    const item = toHistoryItem(session({ logs: [] }), "Upper Body Power");

    assert.equal(item.sets, 0);
    assert.equal(item.volume, 0);
    assert.equal(item.volumeLabel, "0 kg");
    assert.equal(item.unmeasuredSets, 0);
  });

  it("shows a dash for a session stored without a duration", () => {
    const item = toHistoryItem(session({ durationSeconds: null }), "Upper Body Power");
    assert.equal(item.durationLabel, "—");
  });

  it("formats a large volume with thousands separators", () => {
    const item = toHistoryItem(
      session({ logs: [{ weight: 100, reps: 100 }] }),
      "Upper Body Power",
    );
    assert.equal(item.volumeLabel, "10,000 kg");
  });

  it("produces no NaN or undefined for the sparsest possible session", () => {
    const item = toHistoryItem(
      session({ logs: [{ weight: null, reps: null }], durationSeconds: null }),
      null,
    );

    for (const [key, value] of Object.entries(item) as [keyof HistoryItem, unknown][]) {
      assert.notEqual(value, undefined, key);
      if (typeof value === "number") assert.equal(Number.isNaN(value), false, key);
      if (typeof value === "string") assert.equal(value.includes("NaN"), false, key);
    }
  });
});

describe("total_volume is unreachable from a history row", () => {
  it("exposes no stored-total field", () => {
    const item = toHistoryItem(session(), "Upper Body Power");

    assert.equal("totalVolume" in item, false);
    assert.equal("total_volume" in item, false);
  });

  it("reports the recomputed volume even when a stored total disagrees", () => {
    // SessionVolume has no total_volume field, so even smuggling one on
    // changes nothing: the sets remain the only source.
    const smuggled = {
      ...session({ logs: [{ weight: 50, reps: 10 }] }),
      total_volume: 999_999,
      totalVolume: 999_999,
    } as SessionVolume;

    assert.equal(toHistoryItem(smuggled, "Upper Body Power").volume, 500);
  });
});
