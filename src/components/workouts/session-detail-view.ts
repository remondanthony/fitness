// Relative imports rather than the "@/" alias: this module is exercised
// directly by Node's test runner, which has no path mapping.
import { formatNumber } from "../../lib/format.ts";
import type { DetailSet } from "../../lib/data/progress-analytics.ts";

/**
 * Groups a session's sets into the exercises the detail page renders.
 *
 * Nothing is calculated here that the data layer has not already established,
 * and nothing is invented to fill a gap:
 *
 *   * Order is taken, in preference: the catalogue's plan for the workout,
 *     then the order recorded on the session, then the order the sets were
 *     actually performed. An exercise that appears in none of those still
 *     comes last rather than being dropped.
 *   * A planned exercise with no sets is reported as planned and unlogged. It
 *     never receives a fabricated set, and its volume is not counted.
 *   * A set logged without a weight keeps its reps and is counted as a set,
 *     but contributes nothing to volume — the same rule the rest of the
 *     progress system uses.
 *
 * Display names are resolved by the caller and passed in, which keeps the
 * workout and exercise catalogues out of this module and lets it be tested
 * directly.
 */

export type DetailSetRow = {
  setNumber: number;
  /** Null when no load was recorded. Zero is a bodyweight set, not a gap. */
  weight: number | null;
  reps: number | null;
  /** "60 kg", "Bodyweight", or "—" when no load was recorded. */
  loadLabel: string;
  repsLabel: string;
  /** weight x reps, or null when the load is unknown. */
  volume: number | null;
};

export type DetailExercise = {
  exerciseSlug: string;
  /** Catalogue name, or the slug when the exercise is no longer listed. */
  name: string;
  unknownExercise: boolean;
  sets: DetailSetRow[];
  /** Planned for this session but never logged. */
  skipped: boolean;
  volume: number;
  volumeLabel: string;
  /** Sets whose load was not recorded, so the volume understates them. */
  unmeasuredSets: number;
};

function loadLabel(weight: number | null): string {
  if (weight === null || !Number.isFinite(weight)) return "—";
  if (weight === 0) return "Bodyweight";

  return `${formatNumber(weight)} kg`;
}

/** One logged set, formatted. Shared with the exercise-history view so the
 *  NULL-weight and bodyweight rules are written down exactly once. */
export function toSetRow(set: DetailSet): DetailSetRow {
  const weight =
    set.weight !== null && Number.isFinite(set.weight) && set.weight >= 0
      ? set.weight
      : null;
  const reps = set.reps !== null && Number.isFinite(set.reps) && set.reps >= 0 ? set.reps : null;

  return {
    setNumber: set.setNumber,
    weight,
    reps,
    loadLabel: loadLabel(weight),
    repsLabel: reps === null ? "—" : String(reps),
    volume: weight === null ? null : weight * (reps ?? 0),
  };
}

/**
 * The order exercises should appear in.
 *
 * `plannedOrder` is the catalogue's plan when the workout is still listed,
 * falling back to the order recorded on the session. Anything logged that the
 * plan does not mention keeps its place after the planned entries, in the
 * order it was first performed.
 */
export function orderExerciseSlugs(
  plannedOrder: readonly string[],
  loggedInPerformedOrder: readonly string[],
): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];

  for (const slug of plannedOrder) {
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    ordered.push(slug);
  }

  for (const slug of loggedInPerformedOrder) {
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    ordered.push(slug);
  }

  return ordered;
}

/**
 * Builds the exercise blocks for a session.
 *
 * `resolveName` returns null for a slug the catalogue no longer lists, which
 * is the only case that produces a fallback name.
 */
export function buildDetailExercises(
  sets: readonly DetailSet[],
  plannedOrder: readonly string[],
  resolveName: (slug: string) => string | null,
): DetailExercise[] {
  const bySlug = new Map<string, DetailSet[]>();
  const performedOrder: string[] = [];

  // Sets arrive in whatever order the query returned; sort by when they were
  // performed so "first logged" is a fact rather than an accident.
  const chronological = [...sets].sort(
    (a, b) =>
      Date.parse(a.createdAt) - Date.parse(b.createdAt) || a.setNumber - b.setNumber,
  );

  for (const set of chronological) {
    if (!set.exerciseSlug) continue;

    const existing = bySlug.get(set.exerciseSlug);
    if (existing) {
      existing.push(set);
    } else {
      bySlug.set(set.exerciseSlug, [set]);
      performedOrder.push(set.exerciseSlug);
    }
  }

  const ordered = orderExerciseSlugs(plannedOrder, performedOrder);

  return ordered.map((slug) => {
    const own = (bySlug.get(slug) ?? [])
      .map(toSetRow)
      .sort((a, b) => a.setNumber - b.setNumber);

    const volume = own.reduce((total, set) => total + (set.volume ?? 0), 0);
    const displayName = resolveName(slug);

    return {
      exerciseSlug: slug,
      name: displayName ?? slug,
      unknownExercise: displayName === null,
      sets: own,
      // Planned, and nothing was ever logged against it.
      skipped: own.length === 0,
      volume: Math.round(volume * 100) / 100,
      volumeLabel: `${formatNumber(Math.round(volume * 100) / 100)} kg`,
      unmeasuredSets: own.filter((set) => set.volume === null).length,
    };
  });
}
