import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildDetailExercises,
  orderExerciseSlugs,
} from "./session-detail-view.ts";
import type { DetailSet } from "../../lib/data/progress-analytics.ts";

/**
 * Session detail grouping and ordering.
 *
 *   node --experimental-strip-types --test src/components/workouts/session-detail-view.test.ts
 *
 * The volume arithmetic is pinned down by lib/progress/aggregate.test.ts and is
 * not re-tested. What these cover is what the page claims a member did: which
 * exercises, in what order, with which sets — and what it says when the record
 * is incomplete.
 */

let clock = 0;
function set(over: Partial<DetailSet> = {}): DetailSet {
  clock += 60_000;
  return {
    exerciseSlug: "back-squat",
    setNumber: 1,
    weight: 100,
    reps: 5,
    createdAt: new Date(Date.UTC(2026, 8, 20, 9) + clock).toISOString(),
    ...over,
  };
}

/** Everything resolves, so name fallback is not in play. */
const named = (slug: string) => slug.replace(/-/g, " ");

describe("orderExerciseSlugs", () => {
  it("follows the planned order", () => {
    assert.deepEqual(
      orderExerciseSlugs(["a", "b", "c"], ["c", "a"]),
      ["a", "b", "c"],
    );
  });

  it("appends anything logged that the plan does not mention", () => {
    assert.deepEqual(
      orderExerciseSlugs(["a", "b"], ["b", "z", "y"]),
      ["a", "b", "z", "y"],
    );
  });

  it("falls back entirely to the performed order when there is no plan", () => {
    assert.deepEqual(orderExerciseSlugs([], ["c", "a", "b"]), ["c", "a", "b"]);
  });

  it("never repeats a slug", () => {
    assert.deepEqual(orderExerciseSlugs(["a", "a", "b"], ["a", "b"]), ["a", "b"]);
  });

  it("ignores empty slugs", () => {
    assert.deepEqual(orderExerciseSlugs(["", "a"], ["", "b"]), ["a", "b"]);
  });

  it("returns nothing when there is neither plan nor logs", () => {
    assert.deepEqual(orderExerciseSlugs([], []), []);
  });
});

describe("buildDetailExercises — grouping and sets", () => {
  it("groups sets under their exercise and orders them by set number", () => {
    const [exercise] = buildDetailExercises(
      [
        set({ setNumber: 3, weight: 100, reps: 3 }),
        set({ setNumber: 1, weight: 100, reps: 5 }),
        set({ setNumber: 2, weight: 100, reps: 4 }),
      ],
      ["back-squat"],
      named,
    );

    assert.deepEqual(
      exercise.sets.map((s) => s.setNumber),
      [1, 2, 3],
    );
    assert.equal(exercise.volume, 1200);
    assert.equal(exercise.skipped, false);
  });

  it("keeps exercises separate", () => {
    const result = buildDetailExercises(
      [
        set({ exerciseSlug: "back-squat", weight: 100, reps: 5 }),
        set({ exerciseSlug: "bench-press", weight: 60, reps: 8 }),
      ],
      ["back-squat", "bench-press"],
      named,
    );

    assert.deepEqual(
      result.map((e) => [e.exerciseSlug, e.volume]),
      [
        ["back-squat", 500],
        ["bench-press", 480],
      ],
    );
  });

  it("uses the catalogue order even when sets were performed out of order", () => {
    const result = buildDetailExercises(
      [
        set({ exerciseSlug: "bench-press" }),
        set({ exerciseSlug: "back-squat" }),
      ],
      ["back-squat", "bench-press"],
      named,
    );

    assert.deepEqual(result.map((e) => e.exerciseSlug), ["back-squat", "bench-press"]);
  });

  it("falls back to the order sets were performed when there is no plan", () => {
    const result = buildDetailExercises(
      [
        set({ exerciseSlug: "bench-press" }),
        set({ exerciseSlug: "back-squat" }),
      ],
      [],
      named,
    );

    assert.deepEqual(result.map((e) => e.exerciseSlug), ["bench-press", "back-squat"]);
  });
});

describe("buildDetailExercises — planned but unlogged", () => {
  it("marks a planned exercise with no sets as skipped, inventing nothing", () => {
    const result = buildDetailExercises(
      [set({ exerciseSlug: "back-squat" })],
      ["back-squat", "bench-press"],
      named,
    );

    const bench = result.find((e) => e.exerciseSlug === "bench-press");
    assert.ok(bench);
    assert.equal(bench.skipped, true);
    assert.deepEqual(bench.sets, []);
    assert.equal(bench.volume, 0);
  });

  it("keeps a skipped exercise in its planned position", () => {
    const result = buildDetailExercises(
      [set({ exerciseSlug: "deadlift" })],
      ["back-squat", "deadlift"],
      named,
    );

    assert.deepEqual(result.map((e) => e.exerciseSlug), ["back-squat", "deadlift"]);
    assert.equal(result[0].skipped, true);
    assert.equal(result[1].skipped, false);
  });

  it("reports a session with no logs at all as every planned exercise skipped", () => {
    const result = buildDetailExercises([], ["a", "b"], named);

    assert.equal(result.length, 2);
    assert.equal(result.every((e) => e.skipped), true);
    assert.equal(result.every((e) => e.volume === 0), true);
  });

  it("returns nothing when there is neither a plan nor any logs", () => {
    assert.deepEqual(buildDetailExercises([], [], named), []);
  });
});

describe("buildDetailExercises — weights", () => {
  it("labels a bodyweight set rather than showing 0 kg", () => {
    const [exercise] = buildDetailExercises(
      [set({ exerciseSlug: "push-up", weight: 0, reps: 20 })],
      ["push-up"],
      named,
    );

    assert.equal(exercise.sets[0].loadLabel, "Bodyweight");
    assert.equal(exercise.sets[0].weight, 0);
    assert.equal(exercise.sets[0].volume, 0);
    assert.equal(exercise.volume, 0);
    assert.equal(exercise.unmeasuredSets, 0);
  });

  it("shows a dash for an unrecorded weight and leaves it out of the volume", () => {
    const [exercise] = buildDetailExercises(
      [
        set({ weight: 100, reps: 5 }),
        set({ setNumber: 2, weight: null, reps: 5 }),
      ],
      ["back-squat"],
      named,
    );

    assert.equal(exercise.sets[1].loadLabel, "—");
    assert.equal(exercise.sets[1].volume, null);
    assert.equal(exercise.sets[1].repsLabel, "5");
    assert.equal(exercise.volume, 500);
    assert.equal(exercise.unmeasuredSets, 1);
    // The set is still a set.
    assert.equal(exercise.sets.length, 2);
  });

  it("shows a dash for unrecorded reps", () => {
    const [exercise] = buildDetailExercises(
      [set({ weight: 100, reps: null })],
      ["back-squat"],
      named,
    );

    assert.equal(exercise.sets[0].repsLabel, "—");
    assert.equal(exercise.sets[0].volume, 0);
  });

  it("formats a heavy load with separators", () => {
    const [exercise] = buildDetailExercises(
      [set({ weight: 1000, reps: 2 })],
      ["back-squat"],
      named,
    );

    assert.equal(exercise.sets[0].loadLabel, "1,000 kg");
    assert.equal(exercise.volumeLabel, "2,000 kg");
  });
});

describe("buildDetailExercises — unknown slugs", () => {
  it("keeps an exercise the library no longer lists, showing its slug", () => {
    const [exercise] = buildDetailExercises(
      [set({ exerciseSlug: "retired-move" })],
      ["retired-move"],
      () => null,
    );

    assert.equal(exercise.name, "retired-move");
    assert.equal(exercise.unknownExercise, true);
    assert.equal(exercise.sets.length, 1);
  });

  it("keeps a logged exercise absent from the plan", () => {
    const result = buildDetailExercises(
      [set({ exerciseSlug: "surprise-lift" })],
      ["back-squat"],
      named,
    );

    assert.deepEqual(result.map((e) => e.exerciseSlug), ["back-squat", "surprise-lift"]);
    assert.equal(result[1].sets.length, 1);
  });
});

describe("buildDetailExercises — stability", () => {
  it("gives the same answer whatever order the sets arrive in", () => {
    const sets = [
      set({ exerciseSlug: "back-squat", setNumber: 1 }),
      set({ exerciseSlug: "bench-press", setNumber: 1 }),
      set({ exerciseSlug: "back-squat", setNumber: 2 }),
    ];

    assert.deepEqual(
      buildDetailExercises(sets, [], named),
      buildDetailExercises([...sets].reverse(), [], named),
    );
  });

  it("produces no NaN or undefined for the sparsest session", () => {
    const [exercise] = buildDetailExercises(
      [set({ weight: null, reps: null })],
      ["back-squat"],
      () => null,
    );

    for (const [key, value] of Object.entries(exercise)) {
      assert.notEqual(value, undefined, key);
      if (typeof value === "number") assert.equal(Number.isNaN(value), false, key);
      if (typeof value === "string") assert.equal(value.includes("NaN"), false, key);
    }
  });

  it("exposes no stored-total field", () => {
    const [exercise] = buildDetailExercises([set()], ["back-squat"], named);

    assert.equal("totalVolume" in exercise, false);
    assert.equal("total_volume" in exercise, false);
  });
});
