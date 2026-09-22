import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { workouts } from "./workouts.ts";

/**
 * The catalogue carries no member history.
 *
 *   node --experimental-strip-types --test src/data/catalogue.test.ts
 *
 * Regression guard for a defect found in the Part 19 audit: every catalogue
 * exercise shipped a `previous` value, and three workouts shipped a
 * `lastCompleted`. Both are member history, and `/workouts/[slug]` rendered
 * the first of them as "Last: 75 kg x 8" to every visitor — including people
 * who had never trained, and people who were not signed in at all.
 *
 * Both fields are still part of the type, because both are attached at request
 * time from the member's own sessions. What must never happen again is a
 * static file claiming somebody trained something.
 */

describe("catalogue workouts contain no fabricated member history", () => {
  it("ships no `previous` value on any exercise", () => {
    const offenders = workouts.flatMap((workout) =>
      workout.exercises
        .filter((exercise) => exercise.previous !== undefined)
        .map((exercise) => `${workout.slug}/${exercise.id}`),
    );

    assert.deepEqual(
      offenders,
      [],
      "a catalogue exercise claims a previous performance; it must be attached at request time",
    );
  });

  it("ships no `lastCompleted` on any workout", () => {
    assert.deepEqual(
      workouts.filter((workout) => workout.lastCompleted !== undefined).map((w) => w.slug),
      [],
      "a catalogue workout claims to have been trained",
    );
  });

  it("still carries the plan itself, which is legitimately static", () => {
    assert.ok(workouts.length > 0);

    for (const workout of workouts) {
      assert.ok(workout.title, `${workout.slug} has no title`);
      assert.ok(workout.exercises.length > 0, `${workout.slug} has no exercises`);

      for (const exercise of workout.exercises) {
        assert.ok(exercise.sets > 0, `${workout.slug}/${exercise.id} has no planned sets`);
        assert.ok(exercise.reps, `${workout.slug}/${exercise.id} has no target reps`);
        assert.ok(
          exercise.restSeconds > 0,
          `${workout.slug}/${exercise.id} has no rest period`,
        );
      }
    }
  });

  it("exports no sample session list", async () => {
    // `recentWorkouts` was "sessions already trained" as static data.
    const catalogue: Record<string, unknown> = await import("./workouts.ts");

    for (const name of ["recentWorkouts", "recentSessions", "sampleSessions"]) {
      assert.equal(name in catalogue, false, `${name} is fabricated member history`);
    }
  });
});
