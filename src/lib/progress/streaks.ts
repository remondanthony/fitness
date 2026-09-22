// Relative rather than the "@/" alias, for the same reason as records.ts: this
// module is exercised directly by Node's test runner, which has no path mapping.
import { periodKey } from "./aggregate.ts";

/**
 * Workout streaks.
 *
 * Pure functions over the completion timestamps of finished sessions. No
 * database, no session, and no clock of its own — "now" is always passed in,
 * so a streak is reproducible rather than dependent on when it was computed.
 *
 * Days are UTC calendar days, matching the boundary the rest of the progress
 * system and `lib/data/daily-date.ts` already use. If the app ever moves to
 * member-local days, every one of those has to move together.
 *
 * The definition used here:
 *
 *   The current streak is the number of consecutive UTC calendar days ending
 *   on the most recent day the member completed a workout.
 *
 * That counts training days only, so it never runs on through a rest day. It
 * also means a streak that has already lapsed still reports its length — a
 * member who trained four days straight and then stopped for a week has a
 * current streak of 4. `isActive` is what distinguishes the two, and the UI is
 * expected to use it rather than presenting a lapsed streak as live.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Single-letter UTC weekday label, Sunday first, as the dashboard renders. */
const WEEKDAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"] as const;

/** "2026-09-20" for a timestamp, or null when it cannot be read. */
export function utcDayKey(iso: string): string | null {
  const at = Date.parse(iso);
  if (Number.isNaN(at)) return null;

  return periodKey(new Date(at));
}

/**
 * The distinct UTC days a member trained, oldest first.
 *
 * Two sessions on one day are one training day: a streak counts days, not
 * workouts, so a double session cannot inflate it.
 */
export function workoutDays(completedAt: readonly string[]): string[] {
  const days = new Set<string>();

  for (const iso of completedAt) {
    const key = utcDayKey(iso);
    if (key) days.add(key);
  }

  return [...days].sort();
}

function dayDifference(fromKey: string, toKey: string): number {
  return Math.round(
    (Date.parse(`${toKey}T00:00:00Z`) - Date.parse(`${fromKey}T00:00:00Z`)) / DAY_MS,
  );
}

/** Consecutive training days ending on the most recent one. */
export function currentStreak(days: readonly string[]): number {
  if (days.length === 0) return 0;

  let streak = 1;

  for (let index = days.length - 1; index > 0; index -= 1) {
    if (dayDifference(days[index - 1], days[index]) !== 1) break;
    streak += 1;
  }

  return streak;
}

/** The longest run of consecutive training days in the whole history. */
export function longestStreak(days: readonly string[]): number {
  if (days.length === 0) return 0;

  let longest = 1;
  let run = 1;

  for (let index = 1; index < days.length; index += 1) {
    run = dayDifference(days[index - 1], days[index]) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  return longest;
}

export type DayCell = {
  /** UTC date, e.g. "2026-09-20". */
  date: string;
  /** Single letter for the column header. */
  label: string;
  trained: boolean;
  /** The cell for today, which is still in progress. */
  isToday: boolean;
};

/**
 * The last seven UTC days ending today, oldest first.
 *
 * Always seven cells, because the strip is a calendar rather than a list of
 * sessions — an untrained day has to be visible for a trained one to mean
 * anything.
 */
export function lastSevenDays(days: readonly string[], now: Date): DayCell[] {
  const trained = new Set(days);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  const cells: DayCell[] = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const moment = new Date(today - offset * DAY_MS);
    const date = periodKey(moment);

    cells.push({
      date,
      label: WEEKDAY_LETTERS[moment.getUTCDay()],
      trained: trained.has(date),
      isToday: offset === 0,
    });
  }

  return cells;
}

export type StreakSummary = {
  /** Consecutive training days ending on the most recent one. */
  current: number;
  /** Best run ever. Never smaller than `current`. */
  longest: number;
  /** UTC date of the most recent completed workout, or null. */
  lastTrainedOn: string | null;
  /** Whole UTC days since that workout, or null when there has never been one. */
  daysSince: number | null;
  /**
   * The streak is still live: trained today, or yesterday and today is not
   * over. A lapsed streak keeps its length but must not be shown as running.
   */
  isActive: boolean;
  lastSevenDays: DayCell[];
  /** Distinct days trained, all time. */
  totalDays: number;
};

/** Everything the dashboard and profile need about streaks, from one pass. */
export function buildStreakSummary(
  completedAt: readonly string[],
  now: Date,
): StreakSummary {
  const days = workoutDays(completedAt);
  const lastTrainedOn = days.length > 0 ? days[days.length - 1] : null;
  const today = periodKey(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())),
  );

  const daysSince = lastTrainedOn === null ? null : dayDifference(lastTrainedOn, today);

  return {
    current: currentStreak(days),
    longest: longestStreak(days),
    lastTrainedOn,
    daysSince,
    // A future-dated completion would give a negative difference; treated as
    // active rather than as an error, since the row is the member's own.
    isActive: daysSince !== null && daysSince <= 1,
    lastSevenDays: lastSevenDays(days, now),
    totalDays: days.length,
  };
}
