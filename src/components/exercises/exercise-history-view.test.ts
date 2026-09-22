import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  summariseExerciseHistory,
  toExerciseSessionRow,
  toRecordRows,
} from "./exercise-history-view.ts";
import { buildExerciseRecords } from "../../lib/progress/records.ts";
import type { ExerciseSessionEntry } from "../../lib/data/progress-analytics.ts";
import type { DetailSet } from "../../lib/data/progress-analytics.ts";

/**
 * Exercise history rows.
 *
 *   node --experimental-strip-types --test src/components/exercises/exercise-history-view.test.ts
 *
 * The record engine is pinned down by lib/progress/records.test.ts and the
 * volume rules by lib/progress/aggregate.test.ts; neither is re-tested. What
 * these cover is the page's claims: ordering, what it says when a load was
 * never recorded, and that it reuses the existing record engine rather than
 * growing a second one.
 */

function set(over: Partial<DetailSet> = {}): DetailSet {
  return {
    exerciseSlug: "back-squat",
    setNumber: 1,
    weight: 100,
    reps: 5,
    createdAt: "2026-09-20T09:00:00Z",
    ...over,
  };
}

function entry(over: Partial<ExerciseSessionEntry> = {}): ExerciseSessionEntry {
  return {
    sessionId: "s1",
    workoutSlug: "upper-body-power",
    completedAt: "2026-09-20T10:00:00Z",
    sets: [set()],
    ...over,
  };
}

describe("toExerciseSessionRow — ordering and naming", () => {
  it("orders sets by set number regardless of arrival order", () => {
    const row = toExerciseSessionRow(
      entry({
        sets: [
          set({ setNumber: 3, weight: 90 }),
          set({ setNumber: 1, weight: 100 }),
          set({ setNumber: 2, weight: 95 }),
        ],
      }),
      "Upper Body Power",
    );

    assert.deepEqual(row.sets.map((s) => s.setNumber), [1, 2, 3]);
  });

  it("uses the catalogue workout name when it resolves", () => {
    const row = toExerciseSessionRow(entry(), "Upper Body Power");

    assert.equal(row.workoutName, "Upper Body Power");
    assert.equal(row.unknownWorkout, false);
    assert.equal(row.completedLabel, "20 Sep 2026");
  });

  it("keeps a session whose workout has left the catalogue, showing the slug", () => {
    const row = toExerciseSessionRow(entry({ workoutSlug: "retired-workout" }), null);

    assert.equal(row.workoutName, "retired-workout");
    assert.equal(row.unknownWorkout, true);
    assert.equal(row.sets.length, 1);
  });
});

describe("toExerciseSessionRow — weights", () => {
  it("counts a null-weight set but leaves it out of the volume", () => {
    const row = toExerciseSessionRow(
      entry({
        sets: [
          set({ setNumber: 1, weight: 100, reps: 5 }),
          set({ setNumber: 2, weight: null, reps: 5 }),
        ],
      }),
      "Upper Body Power",
    );

    assert.equal(row.sets.length, 2);
    assert.equal(row.sets[1].loadLabel, "—");
    assert.equal(row.sets[1].repsLabel, "5");
    assert.equal(row.volume, 500);
    assert.equal(row.unmeasuredSets, 1);
  });

  it("treats zero weight as a real bodyweight set", () => {
    const row = toExerciseSessionRow(
      entry({ sets: [set({ weight: 0, reps: 25 })] }),
      "Upper Body Power",
    );

    assert.equal(row.sets[0].loadLabel, "Bodyweight");
    assert.equal(row.volume, 0);
    assert.equal(row.volumeLabel, "0 kg");
    assert.equal(row.unmeasuredSets, 0);
  });
});

describe("toRecordRows — reuses the existing record engine", () => {
  it("shows the same records buildExerciseRecords produces", () => {
    const [records] = buildExerciseRecords([
      { exerciseSlug: "back-squat", weight: 100, reps: 5, createdAt: "2026-09-01T10:00:00Z" },
      { exerciseSlug: "back-squat", weight: 120, reps: 3, createdAt: "2026-09-08T10:00:00Z" },
      { exerciseSlug: "back-squat", weight: 60, reps: 12, createdAt: "2026-09-15T10:00:00Z" },
    ]);

    const rows = toRecordRows(records);
    const byLabel = Object.fromEntries(rows.map((r) => [r.label, r]));

    // 120 heaviest, 12 most reps, 720 best single-set volume (60 x 12).
    assert.equal(byLabel["Heaviest Set"].value, "120 kg");
    assert.equal(byLabel["Heaviest Set"].achieved, "8 Sep 2026");
    assert.equal(byLabel["Most Reps"].value, "12");
    assert.equal(byLabel["Best Set Volume"].value, "720 kg");
  });

  it("omits a weight record for a bodyweight-only exercise but keeps reps", () => {
    const [records] = buildExerciseRecords([
      { exerciseSlug: "push-up", weight: 0, reps: 30, createdAt: "2026-09-01T10:00:00Z" },
    ]);

    assert.deepEqual(
      toRecordRows(records).map((r) => r.label),
      ["Most Reps"],
    );
  });

  it("omits weight and volume records when no load was ever recorded", () => {
    const [records] = buildExerciseRecords([
      { exerciseSlug: "plank", weight: null, reps: 1, createdAt: "2026-09-01T10:00:00Z" },
    ]);

    assert.deepEqual(
      toRecordRows(records).map((r) => r.label),
      ["Most Reps"],
    );
  });

  it("returns nothing when there are no records at all", () => {
    assert.deepEqual(toRecordRows(null), []);
  });

  it("invents no record the logs do not support", () => {
    const [records] = buildExerciseRecords([
      { exerciseSlug: "back-squat", weight: 100, reps: 5, createdAt: "2026-09-01T10:00:00Z" },
    ]);

    // A 1RM estimate from 100x5 would be ~112-117. Nothing may produce one.
    for (const row of toRecordRows(records)) {
      assert.ok(
        ["120 kg", "100 kg", "5", "500 kg"].includes(row.value),
        `${row.label} = ${row.value} is not a logged value`,
      );
    }
  });
});

describe("summariseExerciseHistory", () => {
  it("totals sessions, sets and volume", () => {
    const summary = summariseExerciseHistory([
      toExerciseSessionRow(
        entry({ sessionId: "a", sets: [set({ weight: 100, reps: 5 })] }),
        "W",
      ),
      toExerciseSessionRow(
        entry({
          sessionId: "b",
          sets: [set({ setNumber: 1, weight: 60, reps: 8 }), set({ setNumber: 2, weight: 60, reps: 8 })],
        }),
        "W",
      ),
    ]);

    assert.equal(summary.sessionCount, 2);
    assert.equal(summary.totalSets, 3);
    assert.equal(summary.totalVolume, 1460);
    assert.equal(summary.totalVolumeLabel, "1,460 kg");
    assert.equal(summary.hasHistory, true);
  });

  it("reports an empty history without NaN or undefined", () => {
    const summary = summariseExerciseHistory([]);

    assert.equal(summary.sessionCount, 0);
    assert.equal(summary.totalSets, 0);
    assert.equal(summary.totalVolume, 0);
    assert.equal(summary.hasHistory, false);

    for (const [key, value] of Object.entries(summary)) {
      assert.notEqual(value, undefined, key);
      if (typeof value === "number") assert.equal(Number.isNaN(value), false, key);
    }
  });
});

describe("total_volume is unreachable", () => {
  it("exposes no stored-total field on a session row", () => {
    const row = toExerciseSessionRow(entry(), "Upper Body Power");

    assert.equal("totalVolume" in row, false);
    assert.equal("total_volume" in row, false);
  });

  it("reports the recomputed volume even when a stored total is smuggled in", () => {
    const smuggled = {
      ...entry({ sets: [set({ weight: 50, reps: 10 })] }),
      total_volume: 999_999,
    } as ExerciseSessionEntry;

    assert.equal(toExerciseSessionRow(smuggled, "W").volume, 500);
  });
});
