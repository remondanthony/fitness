/**
 * Progress aggregation.
 *
 * Pure functions over rows the data layer has already fetched: no database, no
 * session, no React, no clock of their own. Every function that needs to know
 * "now" is handed it, so the same inputs always produce the same output and
 * the whole module can be tested without a running anything.
 *
 * Two rules are enforced here rather than left to call sites, because both are
 * easy to get quietly wrong:
 *
 *   * Volume is recomputed from the individual sets. `workout_sessions
 *     .total_volume` is written by the browser at the end of a session and is
 *     never read by anything in this file — the session row type below does
 *     not even carry it.
 *   * Only a session with a completion timestamp counts. The query filters on
 *     `completed = true` as well, but a session that somehow lacks
 *     `completed_at` has no place on a timeline and is dropped again here.
 *
 * Periods are bucketed in UTC, matching the day boundary that
 * `lib/data/daily-date.ts` already established for nutrition and wellness. If
 * that ever becomes member-local, both need to change together.
 */

/** One logged set, as far as volume is concerned. */
export type VolumeLog = {
  /** Null when the set was recorded without a load. */
  weight: number | null;
  reps: number | null;
};

/**
 * A completed session and its sets.
 *
 * Deliberately has no `totalVolume` field. The stored column exists, but it is
 * client-supplied and unreconciled, so this module is built so that reaching
 * for it is not possible rather than merely discouraged.
 */
export type SessionForAggregation = {
  id: string;
  workoutSlug: string;
  startedAt: string;
  /** Null sessions are dropped: an unfinished workout is not a workout. */
  completedAt: string | null;
  durationSeconds: number | null;
  logs: VolumeLog[];
};

/** A session with its volume worked out from the sets it actually holds. */
export type SessionVolume = {
  id: string;
  workoutSlug: string;
  startedAt: string;
  completedAt: string;
  durationSeconds: number | null;
  /** Sum of weight x reps across every set that could be counted. */
  volume: number;
  /** Sets that contributed to `volume`. */
  countedSets: number;
  /** Sets left out because no weight was recorded. */
  excludedSets: number;
};

// ---------------------------------------------------------------------------
// Volume
// ---------------------------------------------------------------------------

/**
 * The volume of one set, or null when it cannot be known.
 *
 * A null weight is not zero. Zero means "lifted nothing" — a bodyweight set,
 * which legitimately contributes 0 to a load total. Null means the load was
 * never recorded, and counting that as 0 would quietly understate a real
 * session. The two are separated here so the caller can report how much of a
 * total it was unable to measure.
 */
export function setVolume(log: VolumeLog): number | null {
  if (log.weight === null || log.weight === undefined) return null;
  if (!Number.isFinite(log.weight)) return null;

  const reps = log.reps ?? 0;
  if (!Number.isFinite(reps)) return null;

  // Negative values are impossible per the CHECK constraints; clamped anyway
  // so a bad row can never subtract from a total.
  return Math.max(0, log.weight) * Math.max(0, reps);
}

export type VolumeTotal = {
  volume: number;
  countedSets: number;
  excludedSets: number;
};

/** Adds up a collection of sets, keeping track of what had to be skipped. */
export function sumVolume(logs: readonly VolumeLog[]): VolumeTotal {
  let volume = 0;
  let countedSets = 0;
  let excludedSets = 0;

  for (const log of logs) {
    const value = setVolume(log);

    if (value === null) {
      excludedSets += 1;
      continue;
    }

    volume += value;
    countedSets += 1;
  }

  // numeric(6,2) x smallint can accumulate floating-point dust over a long
  // session; two decimals matches what the column could have held anyway.
  return { volume: Math.round(volume * 100) / 100, countedSets, excludedSets };
}

/**
 * Drops unfinished sessions and works out each remaining session's volume.
 *
 * Ordered newest first, then by id, so a page of history is stable across
 * requests even when two sessions share a completion timestamp.
 */
export function summariseSessions(
  sessions: readonly SessionForAggregation[],
): SessionVolume[] {
  return sessions
    .filter((session): session is SessionForAggregation & { completedAt: string } =>
      Boolean(session.completedAt),
    )
    .map((session) => {
      const totals = sumVolume(session.logs);

      return {
        id: session.id,
        workoutSlug: session.workoutSlug,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        durationSeconds: session.durationSeconds,
        volume: totals.volume,
        countedSets: totals.countedSets,
        excludedSets: totals.excludedSets,
      };
    })
    .sort(
      (a, b) =>
        Date.parse(b.completedAt) - Date.parse(a.completedAt) ||
        a.id.localeCompare(b.id),
    );
}

// ---------------------------------------------------------------------------
// UTC period boundaries
// ---------------------------------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000;

/** Midnight UTC on the ISO week's Monday. */
export function utcWeekStart(moment: Date): Date {
  const start = new Date(
    Date.UTC(moment.getUTCFullYear(), moment.getUTCMonth(), moment.getUTCDate()),
  );

  // getUTCDay is 0 for Sunday; ISO weeks run Monday to Sunday.
  const offset = (start.getUTCDay() + 6) % 7;
  return new Date(start.getTime() - offset * DAY_MS);
}

/** Midnight UTC on the first of the month. */
export function utcMonthStart(moment: Date): Date {
  return new Date(Date.UTC(moment.getUTCFullYear(), moment.getUTCMonth(), 1));
}

/** "2026-09-14" — the period start, as a plain UTC date. */
export function periodKey(start: Date): string {
  return start.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Consistency
// ---------------------------------------------------------------------------

export type PeriodBucket = {
  /** UTC date the period begins, e.g. "2026-09-14". */
  start: string;
  /** Completed sessions whose completion falls inside the period. */
  sessions: number;
  /** Recomputed volume for those sessions. */
  volume: number;
  /** The period containing `now`, which is still being filled. */
  current: boolean;
};

type Granularity = "week" | "month";

function startOf(granularity: Granularity, moment: Date): Date {
  return granularity === "week" ? utcWeekStart(moment) : utcMonthStart(moment);
}

function stepBack(granularity: Granularity, start: Date, periods: number): Date {
  if (granularity === "week") {
    return new Date(start.getTime() - periods * 7 * DAY_MS);
  }

  return new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - periods, 1));
}

/**
 * Sessions and volume per period, oldest first.
 *
 * Every period in the window is present, including the empty ones. A week
 * without training is a fact about the member's consistency, and a chart that
 * simply omitted it would draw a flattering and wrong picture.
 */
function bucket(
  granularity: Granularity,
  sessions: readonly SessionVolume[],
  periods: number,
  now: Date,
): PeriodBucket[] {
  if (periods <= 0) return [];

  const currentStart = startOf(granularity, now);

  const buckets: PeriodBucket[] = [];
  const index = new Map<string, PeriodBucket>();

  for (let offset = periods - 1; offset >= 0; offset -= 1) {
    const start = stepBack(granularity, currentStart, offset);
    const entry: PeriodBucket = {
      start: periodKey(start),
      sessions: 0,
      volume: 0,
      current: offset === 0,
    };

    buckets.push(entry);
    index.set(entry.start, entry);
  }

  for (const session of sessions) {
    const completed = new Date(session.completedAt);
    if (Number.isNaN(completed.getTime())) continue;

    // Anything older than the window, or somehow in the future, has no bucket
    // and is simply not counted rather than being folded into the nearest one.
    const entry = index.get(periodKey(startOf(granularity, completed)));
    if (!entry) continue;

    entry.sessions += 1;
    entry.volume += session.volume;
  }

  for (const entry of buckets) {
    entry.volume = Math.round(entry.volume * 100) / 100;
  }

  return buckets;
}

/** Completed sessions and volume for the last `weeks` UTC weeks, oldest first. */
export function bucketByWeek(
  sessions: readonly SessionVolume[],
  weeks: number,
  now: Date,
): PeriodBucket[] {
  return bucket("week", sessions, weeks, now);
}

/** Completed sessions and volume for the last `months` UTC months, oldest first. */
export function bucketByMonth(
  sessions: readonly SessionVolume[],
  months: number,
  now: Date,
): PeriodBucket[] {
  return bucket("month", sessions, months, now);
}

/** The earliest instant a window of periods covers — used to bound the query. */
export function windowStart(
  granularity: Granularity,
  periods: number,
  now: Date,
): Date {
  return stepBack(granularity, startOf(granularity, now), Math.max(0, periods - 1));
}
