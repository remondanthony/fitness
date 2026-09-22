import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { applyPrefill, buildPrefill } from "./repeat.ts";
import type { DetailSet } from "../data/progress-analytics.ts";

/**
 * Repeat prefill.
 *
 *   node --experimental-strip-types --test src/lib/progress/repeat.test.ts
 *
 * A prefill is a starting value in an input, not a record of anything. These
 * cover the two ways that could go wrong: offering a value the member never
 * produced, and letting the old session shape the new one.
 *
 * Nothing here writes, so "not persisted" is a property of the call graph
 * rather than of this module: these functions return plain objects and have no
 * database access to misuse. The route test below pins the rest.
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

/** The shape applyPrefill operates on, matching a catalogue exercise. */
type TestExercise = {
  id: string;
  exerciseSlug?: string;
  sets: number;
  previous?: { weight: number | null; reps: number };
};

const exercise = (id: string, slug?: string): TestExercise => ({
  id,
  exerciseSlug: slug,
  sets: 3,
});

describe("buildPrefill", () => {
  it("offers the last set of each exercise", () => {
    const prefill = buildPrefill([
      set({ setNumber: 1, weight: 100, reps: 5 }),
      set({ setNumber: 3, weight: 110, reps: 3 }),
      set({ setNumber: 2, weight: 105, reps: 4 }),
    ]);

    assert.deepEqual(prefill.get("back-squat"), { weight: 110, reps: 3 });
  });

  it("keeps each exercise separate", () => {
    const prefill = buildPrefill([
      set({ exerciseSlug: "back-squat", weight: 100, reps: 5 }),
      set({ exerciseSlug: "bench-press", weight: 60, reps: 8 }),
    ]);

    assert.deepEqual(prefill.get("back-squat"), { weight: 100, reps: 5 });
    assert.deepEqual(prefill.get("bench-press"), { weight: 60, reps: 8 });
  });

  it("keeps an unrecorded load as null — never as zero", () => {
    // Zero would claim a bodyweight set that did not happen.
    const prefill = buildPrefill([set({ weight: null, reps: 8 })]);

    assert.deepEqual(prefill.get("back-squat"), { weight: null, reps: 8 });
    assert.notEqual(prefill.get("back-squat")?.weight, 0);
  });

  it("keeps a bodyweight set as zero — never as null", () => {
    const prefill = buildPrefill([set({ exerciseSlug: "push-up", weight: 0, reps: 25 })]);

    assert.deepEqual(prefill.get("push-up"), { weight: 0, reps: 25 });
  });

  it("offers nothing when the reps were never recorded", () => {
    // There would be no number to start the logger with, and inventing one
    // would be a suggestion rather than a memory.
    assert.equal(buildPrefill([set({ reps: null })]).size, 0);
  });

  it("is stable whatever order the sets arrive in", () => {
    const sets = [
      set({ setNumber: 2, weight: 105 }),
      set({ setNumber: 1, weight: 100 }),
      set({ setNumber: 3, weight: 110 }),
    ];

    assert.deepEqual(
      [...buildPrefill(sets)],
      [...buildPrefill([...sets].reverse())],
    );
  });

  it("returns nothing for a session with no logs", () => {
    assert.equal(buildPrefill([]).size, 0);
  });

  it("ignores sets with no usable slug", () => {
    assert.equal(buildPrefill([set({ exerciseSlug: "" })]).size, 0);
  });
});

describe("applyPrefill — the catalogue drives the new session", () => {
  it("attaches the previous effort by exercise slug", () => {
    const result = applyPrefill(
      [exercise("e1", "back-squat"), exercise("e2", "bench-press")],
      buildPrefill([
        set({ exerciseSlug: "back-squat", weight: 110, reps: 3 }),
        set({ exerciseSlug: "bench-press", weight: 60, reps: 8 }),
      ]),
    );

    assert.deepEqual(result[0].previous, { weight: 110, reps: 3 });
    assert.deepEqual(result[1].previous, { weight: 60, reps: 8 });
  });

  it("never injects an exercise the workout no longer contains", () => {
    // The old session had a lift that has since left the workout. The new
    // session is the current plan and nothing else.
    const result = applyPrefill(
      [exercise("e1", "back-squat")],
      buildPrefill([
        set({ exerciseSlug: "back-squat", weight: 110, reps: 3 }),
        set({ exerciseSlug: "retired-move", weight: 40, reps: 10 }),
      ]),
    );

    assert.equal(result.length, 1);
    assert.deepEqual(result.map((e) => e.exerciseSlug), ["back-squat"]);
  });

  it("leaves an exercise new to the workout with no prefill", () => {
    const result = applyPrefill(
      [exercise("e1", "back-squat"), exercise("e2", "brand-new-lift")],
      buildPrefill([set({ exerciseSlug: "back-squat" })]),
    );

    assert.equal(result[1].previous, undefined);
  });

  it("preserves the catalogue's order and set counts", () => {
    const exercises = [exercise("e1", "a"), exercise("e2", "b"), exercise("e3", "c")];
    const result = applyPrefill(exercises, buildPrefill([set({ exerciseSlug: "c" })]));

    assert.deepEqual(result.map((e) => e.id), ["e1", "e2", "e3"]);
    // Set counts come from the plan, never from how many were logged before.
    assert.deepEqual(result.map((e) => e.sets), [3, 3, 3]);
  });

  it("does not fabricate sets when the old session logged a different number", () => {
    // One set logged last time, three planned now. The plan still says three,
    // and none of them is marked done.
    const result = applyPrefill(
      [exercise("e1", "back-squat")],
      buildPrefill([set({ setNumber: 1 })]),
    );

    assert.equal(result[0].sets, 3);
    assert.equal("loggedSets" in result[0], false);
    assert.equal("completed" in result[0], false);
  });

  it("clears any stale previous value when there is nothing to offer", () => {
    const stale = [{ ...exercise("e1", "back-squat"), previous: { weight: 999, reps: 99 } }];
    const result = applyPrefill(stale, buildPrefill([]));

    assert.equal(result[0].previous, undefined);
  });

  it("falls back to the workout-local id when there is no library slug", () => {
    const result = applyPrefill(
      [exercise("bodyweight-hold")],
      buildPrefill([set({ exerciseSlug: "bodyweight-hold", weight: 0, reps: 30 })]),
    );

    assert.deepEqual(result[0].previous, { weight: 0, reps: 30 });
  });

  it("does not mutate the exercises it was given", () => {
    const exercises = [exercise("e1", "back-squat")];
    applyPrefill(exercises, buildPrefill([set({ weight: 110, reps: 3 })]));

    assert.equal("previous" in exercises[0], false);
  });

  it("returns the plan unchanged for an empty previous session", () => {
    const exercises = [exercise("e1", "a"), exercise("e2", "b")];
    const result = applyPrefill(exercises, buildPrefill([]));

    assert.deepEqual(result.map((e) => e.id), ["e1", "e2"]);
    assert.equal(result.every((e) => e.previous === undefined), true);
  });
});

describe("a prefill carries no session identity", () => {
  it("produces only weight and reps — no ids, no totals", () => {
    const prefill = buildPrefill([set({ weight: 110, reps: 3 })]);
    const effort = prefill.get("back-squat");

    assert.deepEqual(Object.keys(effort ?? {}).sort(), ["reps", "weight"]);
    for (const forbidden of ["sessionId", "id", "userId", "user_id", "total_volume", "totalVolume"]) {
      assert.equal(forbidden in (effort ?? {}), false, forbidden);
    }
  });
});
