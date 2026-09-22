import type { DetailSet } from "../data/progress-analytics.ts";

/**
 * Prefill values for repeating a completed workout.
 *
 * Pure functions over sets the data layer has already fetched and already
 * scoped to the member. Nothing here reads or writes anything.
 *
 * What a prefill is, and is not:
 *
 *   * It is a starting value for the set logger's inputs — the same slot the
 *     catalogue's static `previous` already filled. Changing where that value
 *     comes from changes nothing about when a set is recorded: a set becomes
 *     history only when the member logs it through the existing flow.
 *   * It is not a plan. The exercises and set counts come from the current
 *     catalogue, never from the old session, so an exercise that has since
 *     been removed from a workout cannot reappear in a new one.
 *   * It is not a progression suggestion. The value offered is what they
 *     actually did, unchanged.
 *
 * A load that was never recorded stays unrecorded. Null is not rewritten to
 * zero, because zero means a bodyweight set was performed and null means
 * nobody knows what was on the bar.
 */

export type PreviousEffort = {
  /** Null when the last set recorded no load. Zero is a bodyweight set. */
  weight: number | null;
  reps: number;
};

/**
 * The effort to offer per exercise, keyed by exercise slug.
 *
 * The last set of each exercise — the highest `set_number` — because that is
 * where the member finished, and finishing weight is what "what did I do last
 * time" usually means. Ties on set number fall to the later-performed set.
 */
export function buildPrefill(
  sets: readonly DetailSet[],
): Map<string, PreviousEffort> {
  const best = new Map<string, DetailSet>();

  for (const set of sets) {
    if (!set.exerciseSlug) continue;

    const current = best.get(set.exerciseSlug);
    if (
      !current ||
      set.setNumber > current.setNumber ||
      (set.setNumber === current.setNumber &&
        Date.parse(set.createdAt) > Date.parse(current.createdAt))
    ) {
      best.set(set.exerciseSlug, set);
    }
  }

  const prefill = new Map<string, PreviousEffort>();

  for (const [slug, set] of best) {
    const weight =
      typeof set.weight === "number" && Number.isFinite(set.weight) && set.weight >= 0
        ? set.weight
        : null;
    const reps =
      typeof set.reps === "number" && Number.isFinite(set.reps) && set.reps >= 0
        ? set.reps
        : null;

    // Reps are what the logger counts in; without them there is nothing
    // useful to offer, and inventing a number would be a suggestion.
    if (reps === null) continue;

    prefill.set(slug, { weight, reps });
  }

  return prefill;
}

/** The shape this module needs from a workout; the real type is wider. */
type PrefillableExercise = {
  id: string;
  exerciseSlug?: string;
  previous?: { weight: number | null; reps: number };
};

/**
 * Attaches the prefill to the workout the member is about to perform.
 *
 * The catalogue drives the result: every exercise in it is returned, in its
 * own order, with `previous` attached only where the old session has a
 * matching slug. An exercise that has left the workout is simply never
 * consulted, and one that has joined it starts empty.
 */
export function applyPrefill<T extends PrefillableExercise>(
  exercises: readonly T[],
  prefill: ReadonlyMap<string, PreviousEffort>,
): T[] {
  return exercises.map((exercise) => {
    const key = exercise.exerciseSlug ?? exercise.id;
    const previous = prefill.get(key);

    // Absent rather than empty: the logger falls back to its own defaults, and
    // the player shows no "last time" line for an exercise never performed.
    if (!previous) return { ...exercise, previous: undefined };

    return { ...exercise, previous: { weight: previous.weight, reps: previous.reps } };
  });
}
