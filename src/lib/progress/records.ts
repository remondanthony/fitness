// Relative rather than the "@/" alias: this module is exercised directly by
// Node's test runner, which has no path mapping. Its sibling is the only
// runtime import it needs.
import { periodKey, utcWeekStart } from "./aggregate.ts";

/**
 * Personal records and strength trends.
 *
 * Pure functions over sets the data layer has already fetched. No database, no
 * session, no clock of its own — anything needing "now" is handed it, so the
 * same sets always produce the same records.
 *
 * Three rules are enforced here rather than left to call sites:
 *
 *   * Nothing is estimated. There is no one-rep-max formula in this codebase
 *     and this file does not introduce one. Every number returned is a value
 *     that was actually logged, or the product of two of them.
 *   * A null weight is not zero. Null means the load was never recorded, so
 *     the set cannot contribute to a weight or volume record — but its reps
 *     were still performed and still count. Zero, by contrast, is a real
 *     measurement: a bodyweight set.
 *   * Ties go to the earliest set. A record is the first time you did it, not
 *     the most recent time you matched it.
 */

/** One logged set from a completed session. */
export type LoggedSet = {
  exerciseSlug: string;
  /** Null when no load was recorded. Zero is a bodyweight set, not a gap. */
  weight: number | null;
  reps: number | null;
  /** `exercise_logs.created_at` — when this set was performed. */
  createdAt: string;
};

export type RecordEntry = {
  value: number;
  /** `created_at` of the set that set it. */
  achievedAt: string;
  /**
   * The best that stood before this one, or null when this is the first.
   * A real improvement, not a projection — both numbers were logged.
   */
  previous: number | null;
};

export type ExerciseRecords = {
  exerciseSlug: string;
  /** Null when no set for this exercise ever recorded a load. */
  maxWeight: RecordEntry | null;
  bestReps: RecordEntry | null;
  /** weight x reps for a single set. Null when no set recorded a load. */
  bestSetVolume: RecordEntry | null;
  /** Every set logged for this exercise, including ones with no load. */
  totalSets: number;
  /** Sets that recorded a load, so callers can see what was measurable. */
  loadedSets: number;
  lastLoggedAt: string;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * The best set by some measure, with whatever stood before it.
 *
 * `valueOf` returns null for a set the measure cannot read — a null weight for
 * a load record, say — and those sets are skipped rather than counted as zero.
 */
function bestBy(
  sets: readonly LoggedSet[],
  valueOf: (set: LoggedSet) => number | null,
): RecordEntry | null {
  type Candidate = { value: number; at: number; iso: string };

  const candidates: Candidate[] = [];

  for (const set of sets) {
    const value = valueOf(set);
    if (value === null) continue;

    const at = Date.parse(set.createdAt);
    if (Number.isNaN(at)) continue;

    candidates.push({ value, at, iso: set.createdAt });
  }

  if (candidates.length === 0) return null;

  // Highest value wins; an equal value set earlier wins the tie, because the
  // record belongs to the session that first reached it.
  const winner = candidates.reduce((best, candidate) =>
    candidate.value > best.value ||
    (candidate.value === best.value && candidate.at < best.at)
      ? candidate
      : best,
  );

  // What stood before: the best among sets performed strictly earlier.
  const earlier = candidates.filter((candidate) => candidate.at < winner.at);
  const previous =
    earlier.length === 0
      ? null
      : earlier.reduce((max, candidate) => Math.max(max, candidate.value), earlier[0].value);

  return { value: winner.value, achievedAt: winner.iso, previous };
}

/** Load lifted on a set, or null when none was recorded. Zero is valid. */
function weightOf(set: LoggedSet): number | null {
  return isFiniteNumber(set.weight) && set.weight >= 0 ? set.weight : null;
}

/** Reps performed. Counted even when no load was recorded — the reps happened. */
function repsOf(set: LoggedSet): number | null {
  return isFiniteNumber(set.reps) && set.reps >= 0 ? set.reps : null;
}

/** weight x reps for one set. Null when the load is unknown. */
function setVolumeOf(set: LoggedSet): number | null {
  const weight = weightOf(set);
  if (weight === null) return null;

  return weight * (repsOf(set) ?? 0);
}

/**
 * Records for every exercise the member has logged, most-trained first.
 *
 * Ordering is by set count then slug, so the list is stable between requests
 * and the exercises someone actually trains lead it.
 */
export function buildExerciseRecords(
  sets: readonly LoggedSet[],
): ExerciseRecords[] {
  const grouped = new Map<string, LoggedSet[]>();

  for (const set of sets) {
    if (!set.exerciseSlug) continue;

    const existing = grouped.get(set.exerciseSlug);
    if (existing) existing.push(set);
    else grouped.set(set.exerciseSlug, [set]);
  }

  const records: ExerciseRecords[] = [];

  for (const [exerciseSlug, exerciseSets] of grouped) {
    const timestamps = exerciseSets
      .map((set) => Date.parse(set.createdAt))
      .filter((value) => !Number.isNaN(value));

    if (timestamps.length === 0) continue;

    records.push({
      exerciseSlug,
      maxWeight: bestBy(exerciseSets, weightOf),
      bestReps: bestBy(exerciseSets, repsOf),
      bestSetVolume: bestBy(exerciseSets, setVolumeOf),
      totalSets: exerciseSets.length,
      loadedSets: exerciseSets.filter((set) => weightOf(set) !== null).length,
      lastLoggedAt: new Date(Math.max(...timestamps)).toISOString(),
    });
  }

  return records.sort(
    (a, b) => b.totalSets - a.totalSets || a.exerciseSlug.localeCompare(b.exerciseSlug),
  );
}

// ---------------------------------------------------------------------------
// Strength trend
// ---------------------------------------------------------------------------

export type TrendPoint = {
  /** UTC date the week begins. */
  start: string;
  /** Heaviest single set logged for the exercise that week. */
  best: number;
  /** Sets logged for the exercise that week. */
  sets: number;
};

/**
 * The exercise a strength trend should follow.
 *
 * The most-logged exercise that has ever been loaded. Bodyweight-only
 * movements are skipped: their heaviest set is always zero, and a flat line at
 * zero says nothing about strength even though every point in it is true.
 *
 * Returns null when nothing qualifies, which the caller should present as an
 * absence rather than an empty chart.
 */
export function pickTrendExercise(records: readonly ExerciseRecords[]): string | null {
  const loaded = records.filter(
    (record) => record.maxWeight !== null && record.maxWeight.value > 0,
  );

  if (loaded.length === 0) return null;

  // `records` is already sorted most-trained first with a slug tie-break, so
  // the first match is deterministic.
  return loaded[0].exerciseSlug;
}

/**
 * Heaviest set per UTC week for one exercise, oldest first.
 *
 * Only weeks the exercise was actually trained appear. A week with no sets is
 * left out rather than plotted as zero, because zero would claim a session
 * that never happened — the opposite of the consistency chart, where a zero
 * week is itself the measurement.
 *
 * The metric is the heaviest set logged, which is a stored value. No estimate,
 * no formula, no composite score.
 */
export function heaviestSetByWeek(
  sets: readonly LoggedSet[],
  exerciseSlug: string,
): TrendPoint[] {
  const weeks = new Map<string, { best: number; sets: number }>();

  for (const set of sets) {
    if (set.exerciseSlug !== exerciseSlug) continue;

    const weight = weightOf(set);
    if (weight === null) continue;

    const at = Date.parse(set.createdAt);
    if (Number.isNaN(at)) continue;

    const key = periodKey(utcWeekStart(new Date(at)));
    const entry = weeks.get(key);

    if (entry) {
      entry.best = Math.max(entry.best, weight);
      entry.sets += 1;
    } else {
      weeks.set(key, { best: weight, sets: 1 });
    }
  }

  return [...weeks.entries()]
    .map(([start, entry]) => ({ start, best: entry.best, sets: entry.sets }))
    .sort((a, b) => a.start.localeCompare(b.start));
}
