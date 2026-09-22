import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  bucketByMonth,
  bucketByWeek,
  periodKey,
  setVolume,
  summariseSessions,
  sumVolume,
  utcMonthStart,
  utcWeekStart,
  windowStart,
  type SessionForAggregation,
} from "./aggregate.ts";

/**
 * Progress aggregation.
 *
 *   node --experimental-strip-types --test src/lib/progress/aggregate.test.ts
 *
 * These pin down arithmetic a member will read as fact about their own
 * training, so the expectations are written out literally rather than derived
 * from the implementation.
 */

/** A session fixture. `totalVolume` is deliberately absent from the type. */
function session(
  over: Partial<SessionForAggregation> & { id: string },
): SessionForAggregation {
  return {
    workoutSlug: "upper-body-power",
    startedAt: "2026-09-14T09:00:00.000Z",
    completedAt: "2026-09-14T10:00:00.000Z",
    durationSeconds: 3600,
    logs: [],
    ...over,
  };
}

describe("setVolume", () => {
  it("multiplies weight by reps", () => {
    assert.equal(setVolume({ weight: 60, reps: 8 }), 480);
    assert.equal(setVolume({ weight: 22.5, reps: 12 }), 270);
  });

  it("counts a bodyweight set as zero, not as missing", () => {
    assert.equal(setVolume({ weight: 0, reps: 15 }), 0);
  });

  it("counts zero reps as zero", () => {
    assert.equal(setVolume({ weight: 100, reps: 0 }), 0);
    assert.equal(setVolume({ weight: 100, reps: null }), 0);
  });

  it("returns null for an unrecorded weight — not zero", () => {
    // The distinction is the point: zero is a measurement, null is its absence.
    assert.equal(setVolume({ weight: null, reps: 10 }), null);
  });

  it("returns null for values that are not finite", () => {
    assert.equal(setVolume({ weight: Number.NaN, reps: 10 }), null);
    assert.equal(setVolume({ weight: Number.POSITIVE_INFINITY, reps: 5 }), null);
    assert.equal(setVolume({ weight: 50, reps: Number.NaN }), null);
  });

  it("never lets a bad row subtract from a total", () => {
    assert.equal(setVolume({ weight: -50, reps: 10 }), 0);
    assert.equal(setVolume({ weight: 50, reps: -10 }), 0);
  });
});

describe("sumVolume", () => {
  it("adds sets and reports how many counted", () => {
    const totals = sumVolume([
      { weight: 60, reps: 8 },
      { weight: 60, reps: 8 },
      { weight: 70, reps: 5 },
    ]);
    assert.deepEqual(totals, { volume: 1310, countedSets: 3, excludedSets: 0 });
  });

  it("includes bodyweight sets in the count but adds nothing", () => {
    const totals = sumVolume([
      { weight: 0, reps: 20 },
      { weight: 40, reps: 10 },
    ]);
    assert.deepEqual(totals, { volume: 400, countedSets: 2, excludedSets: 0 });
  });

  it("excludes sets with no weight and says how many", () => {
    const totals = sumVolume([
      { weight: 50, reps: 10 },
      { weight: null, reps: 10 },
      { weight: null, reps: 8 },
    ]);
    assert.deepEqual(totals, { volume: 500, countedSets: 1, excludedSets: 2 });
  });

  it("returns zero for no sets at all", () => {
    assert.deepEqual(sumVolume([]), { volume: 0, countedSets: 0, excludedSets: 0 });
  });

  it("rounds away floating-point dust", () => {
    const totals = sumVolume([
      { weight: 22.2, reps: 3 },
      { weight: 10.1, reps: 3 },
    ]);
    assert.equal(totals.volume, 96.9);
  });
});

describe("summariseSessions", () => {
  it("drops a session with no completion timestamp", () => {
    const result = summariseSessions([
      session({ id: "done", logs: [{ weight: 50, reps: 10 }] }),
      session({ id: "abandoned", completedAt: null, logs: [{ weight: 99, reps: 99 }] }),
    ]);

    assert.equal(result.length, 1);
    assert.equal(result[0].id, "done");
    assert.equal(result[0].volume, 500);
  });

  it("handles multiple exercises and multiple sets in one session", () => {
    const result = summariseSessions([
      session({
        id: "s1",
        logs: [
          { weight: 100, reps: 5 }, // squat
          { weight: 100, reps: 5 },
          { weight: 60, reps: 8 }, // bench
          { weight: 60, reps: 8 },
          { weight: 0, reps: 12 }, // push-up
        ],
      }),
    ]);

    assert.equal(result[0].volume, 1960);
    assert.equal(result[0].countedSets, 5);
    assert.equal(result[0].excludedSets, 0);
  });

  it("orders newest first, breaking ties on id so paging is stable", () => {
    const shared = "2026-09-14T10:00:00.000Z";
    const result = summariseSessions([
      session({ id: "b", completedAt: shared }),
      session({ id: "a", completedAt: shared }),
      session({ id: "newer", completedAt: "2026-09-15T10:00:00.000Z" }),
    ]);

    assert.deepEqual(
      result.map((entry) => entry.id),
      ["newer", "a", "b"],
    );
  });

  it("returns nothing for an empty history", () => {
    assert.deepEqual(summariseSessions([]), []);
  });
});

describe("workout_sessions.total_volume is never the source", () => {
  it("ignores a stored total that disagrees with the sets", () => {
    // A browser-supplied total_volume could say anything. It is not part of
    // SessionForAggregation, so even smuggling it onto the object changes
    // nothing — the sets are the only input.
    const smuggled = {
      ...session({ id: "s1", logs: [{ weight: 50, reps: 10 }] }),
      total_volume: 999_999,
      totalVolume: 999_999,
    } as SessionForAggregation;

    const result = summariseSessions([smuggled]);
    assert.equal(result[0].volume, 500);
  });

  it("does not expose a total_volume field on its output", () => {
    const result = summariseSessions([session({ id: "s1" })]);
    assert.equal("totalVolume" in result[0], false);
    assert.equal("total_volume" in result[0], false);
  });
});

describe("UTC boundaries", () => {
  it("starts a week on the ISO Monday, in UTC", () => {
    // 2026-09-16 is a Wednesday; its week begins Monday the 14th.
    assert.equal(periodKey(utcWeekStart(new Date("2026-09-16T12:00:00Z"))), "2026-09-14");
    assert.equal(periodKey(utcWeekStart(new Date("2026-09-14T00:00:00Z"))), "2026-09-14");
    // Sunday belongs to the week that started the previous Monday.
    assert.equal(periodKey(utcWeekStart(new Date("2026-09-20T23:59:59Z"))), "2026-09-14");
    // One second later is a new week.
    assert.equal(periodKey(utcWeekStart(new Date("2026-09-21T00:00:00Z"))), "2026-09-21");
  });

  it("buckets by UTC, not by local time", () => {
    // 23:30 UTC on the 20th is already the 21st in +02:00. UTC decides.
    assert.equal(periodKey(utcWeekStart(new Date("2026-09-20T23:30:00Z"))), "2026-09-14");
  });

  it("starts a month on the first, in UTC", () => {
    assert.equal(periodKey(utcMonthStart(new Date("2026-09-16T12:00:00Z"))), "2026-09-01");
    assert.equal(periodKey(utcMonthStart(new Date("2026-09-01T00:00:00Z"))), "2026-09-01");
    assert.equal(periodKey(utcMonthStart(new Date("2026-09-30T23:59:59Z"))), "2026-09-01");
  });
});

describe("bucketByWeek", () => {
  const now = new Date("2026-09-16T12:00:00Z"); // Wednesday, week of the 14th

  it("returns every week in the window, including empty ones", () => {
    const buckets = bucketByWeek([], 4, now);

    assert.deepEqual(
      buckets.map((b) => b.start),
      ["2026-08-24", "2026-08-31", "2026-09-07", "2026-09-14"],
    );
    assert.deepEqual(
      buckets.map((b) => b.sessions),
      [0, 0, 0, 0],
    );
    // Oldest first, and only the last one is in progress.
    assert.deepEqual(
      buckets.map((b) => b.current),
      [false, false, false, true],
    );
  });

  it("counts sessions and volume into the right week", () => {
    const sessions = summariseSessions([
      session({
        id: "a",
        completedAt: "2026-09-15T08:00:00Z",
        logs: [{ weight: 50, reps: 10 }],
      }),
      session({
        id: "b",
        completedAt: "2026-09-16T08:00:00Z",
        logs: [{ weight: 60, reps: 10 }],
      }),
      session({
        id: "c",
        completedAt: "2026-09-08T08:00:00Z",
        logs: [{ weight: 40, reps: 10 }],
      }),
    ]);

    const buckets = bucketByWeek(sessions, 4, now);
    const byStart = Object.fromEntries(buckets.map((b) => [b.start, b]));

    assert.equal(byStart["2026-09-14"].sessions, 2);
    assert.equal(byStart["2026-09-14"].volume, 1100);
    assert.equal(byStart["2026-09-07"].sessions, 1);
    assert.equal(byStart["2026-09-07"].volume, 400);
    assert.equal(byStart["2026-08-31"].sessions, 0);
  });

  it("places a Sunday-night session in the week that began on Monday", () => {
    const sessions = summariseSessions([
      session({ id: "sun", completedAt: "2026-09-13T23:59:00Z" }),
    ]);
    const byStart = Object.fromEntries(
      bucketByWeek(sessions, 4, now).map((b) => [b.start, b]),
    );

    assert.equal(byStart["2026-09-07"].sessions, 1);
    assert.equal(byStart["2026-09-14"].sessions, 0);
  });

  it("ignores sessions older than the window rather than folding them in", () => {
    const sessions = summariseSessions([
      session({ id: "ancient", completedAt: "2025-01-01T08:00:00Z" }),
    ]);
    const buckets = bucketByWeek(sessions, 4, now);

    assert.equal(
      buckets.reduce((sum, b) => sum + b.sessions, 0),
      0,
    );
  });

  it("excludes an unfinished session end to end", () => {
    const sessions = summariseSessions([
      session({
        id: "open",
        completedAt: null,
        logs: [{ weight: 100, reps: 10 }],
      }),
    ]);
    const buckets = bucketByWeek(sessions, 4, now);

    assert.equal(
      buckets.reduce((sum, b) => sum + b.sessions, 0),
      0,
    );
    assert.equal(
      buckets.reduce((sum, b) => sum + b.volume, 0),
      0,
    );
  });

  it("returns nothing for a non-positive window", () => {
    assert.deepEqual(bucketByWeek([], 0, now), []);
    assert.deepEqual(bucketByWeek([], -3, now), []);
  });
});

describe("bucketByMonth", () => {
  const now = new Date("2026-09-16T12:00:00Z");

  it("returns every month in the window, oldest first", () => {
    const buckets = bucketByMonth([], 4, now);

    assert.deepEqual(
      buckets.map((b) => b.start),
      ["2026-06-01", "2026-07-01", "2026-08-01", "2026-09-01"],
    );
    assert.deepEqual(
      buckets.map((b) => b.current),
      [false, false, false, true],
    );
  });

  it("counts into the right month and crosses a year boundary", () => {
    const january = new Date("2026-01-15T12:00:00Z");
    const sessions = summariseSessions([
      session({ id: "dec", completedAt: "2025-12-31T23:00:00Z" }),
      session({ id: "jan", completedAt: "2026-01-01T00:00:00Z" }),
    ]);

    const byStart = Object.fromEntries(
      bucketByMonth(sessions, 3, january).map((b) => [b.start, b]),
    );

    assert.deepEqual(Object.keys(byStart), ["2025-11-01", "2025-12-01", "2026-01-01"]);
    assert.equal(byStart["2025-12-01"].sessions, 1);
    assert.equal(byStart["2026-01-01"].sessions, 1);
  });
});

describe("windowStart", () => {
  const now = new Date("2026-09-16T12:00:00Z");

  it("reaches back to the first week the window covers", () => {
    assert.equal(periodKey(windowStart("week", 4, now)), "2026-08-24");
    assert.equal(periodKey(windowStart("week", 1, now)), "2026-09-14");
  });

  it("reaches back to the first month the window covers", () => {
    assert.equal(periodKey(windowStart("month", 6, now)), "2026-04-01");
  });

  it("never reaches forward for a non-positive window", () => {
    assert.equal(periodKey(windowStart("week", 0, now)), "2026-09-14");
  });
});
