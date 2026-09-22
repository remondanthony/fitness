import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildExerciseRecords,
  heaviestSetByWeek,
  pickTrendExercise,
  type LoggedSet,
} from "./records.ts";

/**
 * Personal records and strength trends.
 *
 *   node --experimental-strip-types --test src/lib/progress/records.test.ts
 *
 * A personal record is a claim about something a member did. These pin the
 * claims down literally rather than deriving the expectation from the code.
 *
 * Note on session filtering: only sets from completed sessions ever reach
 * these functions — the query filters on `completed = true` before they are
 * called — so the exclusion is tested by showing that a set never handed in
 * cannot appear in a record, which is the guarantee that matters here.
 */

function set(over: Partial<LoggedSet> & { createdAt: string }): LoggedSet {
  return { exerciseSlug: "back-squat", weight: 100, reps: 5, ...over };
}

describe("buildExerciseRecords — max weight", () => {
  it("returns the heaviest set and when it happened", () => {
    const [record] = buildExerciseRecords([
      set({ weight: 100, reps: 5, createdAt: "2026-09-01T10:00:00Z" }),
      set({ weight: 120, reps: 3, createdAt: "2026-09-08T10:00:00Z" }),
      set({ weight: 110, reps: 4, createdAt: "2026-09-15T10:00:00Z" }),
    ]);

    assert.equal(record.maxWeight?.value, 120);
    assert.equal(record.maxWeight?.achievedAt, "2026-09-08T10:00:00Z");
    assert.equal(record.maxWeight?.previous, 100);
  });

  it("reports no previous best for a first-ever set", () => {
    const [record] = buildExerciseRecords([
      set({ weight: 80, createdAt: "2026-09-01T10:00:00Z" }),
    ]);

    assert.equal(record.maxWeight?.value, 80);
    assert.equal(record.maxWeight?.previous, null);
  });

  it("ignores sets with no recorded weight", () => {
    const [record] = buildExerciseRecords([
      set({ weight: null, reps: 10, createdAt: "2026-09-01T10:00:00Z" }),
      set({ weight: 60, reps: 10, createdAt: "2026-09-02T10:00:00Z" }),
    ]);

    assert.equal(record.maxWeight?.value, 60);
    assert.equal(record.loadedSets, 1);
    assert.equal(record.totalSets, 2);
  });

  it("returns null when no set ever recorded a weight", () => {
    const [record] = buildExerciseRecords([
      set({ weight: null, reps: 12, createdAt: "2026-09-01T10:00:00Z" }),
    ]);

    assert.equal(record.maxWeight, null);
    assert.equal(record.bestSetVolume, null);
    // The reps still happened and are still a record.
    assert.equal(record.bestReps?.value, 12);
  });

  it("treats weight 0 as a real measurement, not a gap", () => {
    const [record] = buildExerciseRecords([
      set({ exerciseSlug: "push-up", weight: 0, reps: 30, createdAt: "2026-09-01T10:00:00Z" }),
    ]);

    assert.equal(record.maxWeight?.value, 0);
    assert.equal(record.loadedSets, 1);
    assert.equal(record.bestSetVolume?.value, 0);
  });
});

describe("buildExerciseRecords — best reps", () => {
  it("returns the highest reps and its date", () => {
    const [record] = buildExerciseRecords([
      set({ reps: 5, createdAt: "2026-09-01T10:00:00Z" }),
      set({ reps: 12, createdAt: "2026-09-08T10:00:00Z" }),
    ]);

    assert.equal(record.bestReps?.value, 12);
    assert.equal(record.bestReps?.achievedAt, "2026-09-08T10:00:00Z");
  });

  it("counts reps from a set with no recorded weight", () => {
    const [record] = buildExerciseRecords([
      set({ weight: 100, reps: 5, createdAt: "2026-09-01T10:00:00Z" }),
      set({ weight: null, reps: 20, createdAt: "2026-09-02T10:00:00Z" }),
    ]);

    assert.equal(record.bestReps?.value, 20);
  });

  it("handles zero reps without treating it as missing", () => {
    const [record] = buildExerciseRecords([
      set({ weight: 100, reps: 0, createdAt: "2026-09-01T10:00:00Z" }),
    ]);

    assert.equal(record.bestReps?.value, 0);
    assert.equal(record.bestSetVolume?.value, 0);
    assert.equal(record.maxWeight?.value, 100);
  });
});

describe("buildExerciseRecords — best single-set volume", () => {
  it("returns the heaviest weight x reps for one set", () => {
    const [record] = buildExerciseRecords([
      set({ weight: 100, reps: 5, createdAt: "2026-09-01T10:00:00Z" }), // 500
      set({ weight: 60, reps: 12, createdAt: "2026-09-08T10:00:00Z" }), // 720
      set({ weight: 120, reps: 3, createdAt: "2026-09-15T10:00:00Z" }), // 360
    ]);

    assert.equal(record.bestSetVolume?.value, 720);
    assert.equal(record.bestSetVolume?.achievedAt, "2026-09-08T10:00:00Z");
    assert.equal(record.bestSetVolume?.previous, 500);
  });

  it("excludes a set with no weight from volume entirely", () => {
    const [record] = buildExerciseRecords([
      set({ weight: null, reps: 100, createdAt: "2026-09-01T10:00:00Z" }),
      set({ weight: 10, reps: 10, createdAt: "2026-09-02T10:00:00Z" }),
    ]);

    // Were null read as zero, the first set would still be 0 — but were it
    // read as "some unknown load", it could wrongly beat the second.
    assert.equal(record.bestSetVolume?.value, 100);
  });
});

describe("buildExerciseRecords — deterministic ties", () => {
  it("awards a tied record to the earliest set", () => {
    const [record] = buildExerciseRecords([
      set({ weight: 100, reps: 5, createdAt: "2026-09-15T10:00:00Z" }),
      set({ weight: 100, reps: 5, createdAt: "2026-09-01T10:00:00Z" }),
      set({ weight: 100, reps: 5, createdAt: "2026-09-08T10:00:00Z" }),
    ]);

    assert.equal(record.maxWeight?.achievedAt, "2026-09-01T10:00:00Z");
    assert.equal(record.bestSetVolume?.achievedAt, "2026-09-01T10:00:00Z");
  });

  it("gives the same answer whatever order the sets arrive in", () => {
    const sets = [
      set({ weight: 100, createdAt: "2026-09-15T10:00:00Z" }),
      set({ weight: 100, createdAt: "2026-09-01T10:00:00Z" }),
      set({ weight: 90, createdAt: "2026-09-08T10:00:00Z" }),
    ];

    const forward = buildExerciseRecords(sets)[0].maxWeight;
    const reversed = buildExerciseRecords([...sets].reverse())[0].maxWeight;

    assert.deepEqual(forward, reversed);
  });

  it("reports no improvement when the record was never beaten", () => {
    const [record] = buildExerciseRecords([
      set({ weight: 100, createdAt: "2026-09-01T10:00:00Z" }),
      set({ weight: 100, createdAt: "2026-09-08T10:00:00Z" }),
    ]);

    // The earliest set holds it, so nothing stood before it.
    assert.equal(record.maxWeight?.previous, null);
  });
});

describe("buildExerciseRecords — multiple exercises and sessions", () => {
  it("keeps each exercise's records separate", () => {
    const records = buildExerciseRecords([
      set({ exerciseSlug: "back-squat", weight: 140, reps: 3, createdAt: "2026-09-01T10:00:00Z" }),
      set({ exerciseSlug: "back-squat", weight: 150, reps: 2, createdAt: "2026-09-08T10:00:00Z" }),
      set({ exerciseSlug: "bench-press", weight: 90, reps: 5, createdAt: "2026-09-08T11:00:00Z" }),
    ]);

    const bySlug = Object.fromEntries(records.map((r) => [r.exerciseSlug, r]));
    assert.equal(bySlug["back-squat"].maxWeight?.value, 150);
    assert.equal(bySlug["bench-press"].maxWeight?.value, 90);
    assert.equal(bySlug["back-squat"].totalSets, 2);
    assert.equal(bySlug["bench-press"].totalSets, 1);
  });

  it("orders by most-trained, then slug, so the list is stable", () => {
    const records = buildExerciseRecords([
      set({ exerciseSlug: "zebra-lift", createdAt: "2026-09-01T10:00:00Z" }),
      set({ exerciseSlug: "apple-lift", createdAt: "2026-09-01T10:00:00Z" }),
      set({ exerciseSlug: "back-squat", createdAt: "2026-09-01T10:00:00Z" }),
      set({ exerciseSlug: "back-squat", createdAt: "2026-09-02T10:00:00Z" }),
    ]);

    assert.deepEqual(
      records.map((r) => r.exerciseSlug),
      ["back-squat", "apple-lift", "zebra-lift"],
    );
  });

  it("tracks the most recent time each exercise was logged", () => {
    const [record] = buildExerciseRecords([
      set({ createdAt: "2026-09-01T10:00:00Z" }),
      set({ createdAt: "2026-09-20T10:00:00Z" }),
      set({ createdAt: "2026-09-08T10:00:00Z" }),
    ]);

    assert.equal(record.lastLoggedAt, "2026-09-20T10:00:00.000Z");
  });

  it("never lets a set that was not handed in reach a record", () => {
    // Sets from abandoned sessions are filtered out by the query. Given only
    // the completed ones, the record can only reflect those.
    const completedOnly = [
      set({ weight: 80, createdAt: "2026-09-01T10:00:00Z" }),
    ];

    assert.equal(buildExerciseRecords(completedOnly)[0].maxWeight?.value, 80);
  });
});

describe("buildExerciseRecords — edge cases", () => {
  it("returns nothing for an empty history", () => {
    assert.deepEqual(buildExerciseRecords([]), []);
  });

  it("keeps an unknown slug rather than dropping the record", () => {
    // Name resolution is the UI's problem; the record is still real.
    const records = buildExerciseRecords([
      set({ exerciseSlug: "not-in-the-catalogue", createdAt: "2026-09-01T10:00:00Z" }),
    ]);

    assert.equal(records.length, 1);
    assert.equal(records[0].exerciseSlug, "not-in-the-catalogue");
  });

  it("skips sets with no usable slug or timestamp", () => {
    assert.deepEqual(buildExerciseRecords([set({ exerciseSlug: "", createdAt: "2026-09-01T10:00:00Z" })]), []);
    assert.deepEqual(buildExerciseRecords([set({ createdAt: "not-a-date" })]), []);
  });

  it("produces no NaN anywhere", () => {
    const records = buildExerciseRecords([
      set({ weight: null, reps: null, createdAt: "2026-09-01T10:00:00Z" }),
    ]);

    for (const entry of [records[0].maxWeight, records[0].bestReps, records[0].bestSetVolume]) {
      if (entry) assert.equal(Number.isNaN(entry.value), false);
    }
  });
});

describe("no estimate is ever produced", () => {
  it("returns only values that were logged, or the product of two of them", () => {
    const [record] = buildExerciseRecords([
      set({ weight: 100, reps: 5, createdAt: "2026-09-01T10:00:00Z" }),
    ]);

    // A 1RM estimate from 100kg x 5 would be roughly 112-117 under the common
    // formulas. Nothing here may produce such a number.
    assert.equal(record.maxWeight?.value, 100);
    assert.equal(record.bestReps?.value, 5);
    assert.equal(record.bestSetVolume?.value, 500);

    const values = [record.maxWeight, record.bestReps, record.bestSetVolume]
      .map((entry) => entry?.value)
      .filter((value): value is number => value !== undefined);

    for (const value of values) {
      assert.ok(
        [100, 5, 500].includes(value),
        `${value} is neither a logged value nor the product of two`,
      );
    }
  });

  it("exposes no percentage or score field", () => {
    const [record] = buildExerciseRecords([set({ createdAt: "2026-09-01T10:00:00Z" })]);
    const keys = Object.keys(record).join(",");

    for (const forbidden of ["percent", "percentage", "score", "oneRepMax", "estimated", "e1rm"]) {
      assert.equal(keys.toLowerCase().includes(forbidden.toLowerCase()), false, forbidden);
    }
  });
});

describe("pickTrendExercise", () => {
  it("chooses the most-trained exercise that has been loaded", () => {
    const records = buildExerciseRecords([
      set({ exerciseSlug: "push-up", weight: 0, reps: 20, createdAt: "2026-09-01T10:00:00Z" }),
      set({ exerciseSlug: "push-up", weight: 0, reps: 20, createdAt: "2026-09-02T10:00:00Z" }),
      set({ exerciseSlug: "push-up", weight: 0, reps: 20, createdAt: "2026-09-03T10:00:00Z" }),
      set({ exerciseSlug: "back-squat", weight: 100, reps: 5, createdAt: "2026-09-01T10:00:00Z" }),
    ]);

    // push-up is logged more often, but its heaviest set is always zero and a
    // flat line at zero says nothing about strength.
    assert.equal(pickTrendExercise(records), "back-squat");
  });

  it("returns null when nothing has ever been loaded", () => {
    const records = buildExerciseRecords([
      set({ exerciseSlug: "push-up", weight: 0, reps: 20, createdAt: "2026-09-01T10:00:00Z" }),
      set({ exerciseSlug: "plank", weight: null, reps: 1, createdAt: "2026-09-01T10:00:00Z" }),
    ]);

    assert.equal(pickTrendExercise(records), null);
  });

  it("returns null for an empty history", () => {
    assert.equal(pickTrendExercise([]), null);
  });
});

describe("heaviestSetByWeek", () => {
  it("returns the heaviest set for each week, oldest first", () => {
    const points = heaviestSetByWeek(
      [
        set({ weight: 100, createdAt: "2026-09-01T10:00:00Z" }), // week of 31 Aug
        set({ weight: 105, createdAt: "2026-09-03T10:00:00Z" }), // same week
        set({ weight: 110, createdAt: "2026-09-09T10:00:00Z" }), // week of 7 Sep
      ],
      "back-squat",
    );

    assert.deepEqual(points, [
      { start: "2026-08-31", best: 105, sets: 2 },
      { start: "2026-09-07", best: 110, sets: 1 },
    ]);
  });

  it("uses UTC week boundaries, matching the consistency chart", () => {
    const points = heaviestSetByWeek(
      [
        set({ weight: 100, createdAt: "2026-09-13T23:59:00Z" }), // Sunday
        set({ weight: 120, createdAt: "2026-09-14T00:00:00Z" }), // Monday
      ],
      "back-squat",
    );

    assert.deepEqual(
      points.map((p) => p.start),
      ["2026-09-07", "2026-09-14"],
    );
  });

  it("omits weeks with no sets rather than plotting a zero", () => {
    const points = heaviestSetByWeek(
      [
        set({ weight: 100, createdAt: "2026-09-01T10:00:00Z" }),
        set({ weight: 110, createdAt: "2026-09-21T10:00:00Z" }),
      ],
      "back-squat",
    );

    // A zero for the untrained fortnight would claim sessions that never were.
    assert.equal(points.length, 2);
  });

  it("returns a single point for a single week", () => {
    const points = heaviestSetByWeek(
      [set({ weight: 100, createdAt: "2026-09-01T10:00:00Z" })],
      "back-squat",
    );

    assert.deepEqual(points, [{ start: "2026-08-31", best: 100, sets: 1 }]);
  });

  it("only follows the requested exercise", () => {
    const points = heaviestSetByWeek(
      [
        set({ exerciseSlug: "back-squat", weight: 100, createdAt: "2026-09-01T10:00:00Z" }),
        set({ exerciseSlug: "bench-press", weight: 200, createdAt: "2026-09-01T10:00:00Z" }),
      ],
      "back-squat",
    );

    assert.deepEqual(points, [{ start: "2026-08-31", best: 100, sets: 1 }]);
  });

  it("ignores sets with no recorded weight", () => {
    const points = heaviestSetByWeek(
      [
        set({ weight: null, createdAt: "2026-09-01T10:00:00Z" }),
        set({ weight: 90, createdAt: "2026-09-02T10:00:00Z" }),
      ],
      "back-squat",
    );

    assert.deepEqual(points, [{ start: "2026-08-31", best: 90, sets: 1 }]);
  });

  it("returns nothing for an empty history or an unlogged exercise", () => {
    assert.deepEqual(heaviestSetByWeek([], "back-squat"), []);
    assert.deepEqual(
      heaviestSetByWeek([set({ createdAt: "2026-09-01T10:00:00Z" })], "never-done"),
      [],
    );
  });

  it("is stable whatever order the sets arrive in", () => {
    const sets = [
      set({ weight: 100, createdAt: "2026-09-03T10:00:00Z" }),
      set({ weight: 110, createdAt: "2026-09-09T10:00:00Z" }),
      set({ weight: 105, createdAt: "2026-09-01T10:00:00Z" }),
    ];

    assert.deepEqual(
      heaviestSetByWeek(sets, "back-squat"),
      heaviestSetByWeek([...sets].reverse(), "back-squat"),
    );
  });
});
