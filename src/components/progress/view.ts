// Relative for the same reason as lib/progress/records.ts: this module is run
// directly by Node's test runner, which has no path mapping.
import { formatNumber } from "../../lib/format.ts";
import type { PersonalRecord, SeriesPoint } from "@/data/progress";
import type { PeriodBucket } from "@/lib/progress/aggregate";
import type { ExerciseRecords, TrendPoint } from "@/lib/progress/records";

/**
 * Turns the buckets the analytics layer returns into what the existing charts
 * and stat cards expect.
 *
 * Presentation only. Nothing here recomputes volume — the numbers arrive
 * already worked out from `exercise_logs`, and this file just adds up buckets
 * and formats dates. Date formatting lives here rather than in the data layer
 * because a week's label is a property of the page, not of the data.
 *
 * Kept free of React so it can be tested directly.
 */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/**
 * "2026-09-14" → "14 Sep".
 *
 * Built from the date parts rather than `toLocaleDateString`, which depends on
 * whichever ICU build is running: the same call returns "14 Sept" on this
 * Node and "14 Sep" elsewhere. An axis label that changes width between
 * environments is a poor foundation for a chart, so the month names are fixed
 * here.
 *
 * Read in UTC to match the boundary the buckets were cut on — a week labelled
 * in the reader's timezone could name a different day from the one it counts.
 */
export function formatWeekLabel(isoStart: string): string {
  const moment = new Date(`${isoStart}T00:00:00Z`);
  if (Number.isNaN(moment.getTime())) return isoStart;

  return `${moment.getUTCDate()} ${MONTHS[moment.getUTCMonth()]}`;
}

/** Completed sessions per week, for the bar chart. */
export function toSessionSeries(buckets: readonly PeriodBucket[]): SeriesPoint[] {
  return buckets.map((bucket) => ({
    label: formatWeekLabel(bucket.start),
    value: bucket.sessions,
    current: bucket.current,
  }));
}

/** Training volume per week, for the line chart. */
export function toVolumeSeries(buckets: readonly PeriodBucket[]): SeriesPoint[] {
  return buckets.map((bucket) => ({
    label: formatWeekLabel(bucket.start),
    value: bucket.volume,
    current: bucket.current,
  }));
}

export type ProgressSummary = {
  /** Completed sessions across the whole window. */
  sessions: number;
  /** Total volume across the whole window. */
  volume: number;
  /** Sessions in the week still in progress. */
  currentWeekSessions: number;
  /**
   * Mean sessions across the finished weeks only. The current week is part-way
   * through, so including it would drag the average down for no reason.
   * Zero — never NaN — when there is no finished week to average.
   */
  averagePerWeek: number;
  /** False when the member has never completed a session in this window. */
  hasHistory: boolean;
};

/** Window totals, derived by adding up buckets — not by re-reading any logs. */
export function summariseWindow(buckets: readonly PeriodBucket[]): ProgressSummary {
  const sessions = buckets.reduce((total, bucket) => total + bucket.sessions, 0);
  const volume = buckets.reduce((total, bucket) => total + bucket.volume, 0);

  const finished = buckets.filter((bucket) => !bucket.current);
  const finishedSessions = finished.reduce((total, bucket) => total + bucket.sessions, 0);

  return {
    sessions,
    volume: Math.round(volume * 100) / 100,
    currentWeekSessions: buckets.find((bucket) => bucket.current)?.sessions ?? 0,
    // Guarded: an empty window would otherwise divide by zero and print NaN.
    averagePerWeek:
      finished.length === 0
        ? 0
        : Math.round((finishedSessions / finished.length) * 10) / 10,
    hasHistory: sessions > 0,
  };
}

// ---------------------------------------------------------------------------
// Personal records and strength trend
// ---------------------------------------------------------------------------

/**
 * "2026-09-08T10:00:00Z" → "8 Sep 2026".
 *
 * Built from the date parts for the same reason as the week labels: ICU builds
 * disagree on the short month name, and a record's date should read the same
 * everywhere. UTC, matching the boundary everything else is cut on.
 */
export function formatRecordDate(iso: string): string {
  const moment = new Date(iso);
  if (Number.isNaN(moment.getTime())) return "";

  return `${moment.getUTCDate()} ${MONTHS[moment.getUTCMonth()]} ${moment.getUTCFullYear()}`;
}

/** The heaviest-set trend, as points the line chart can draw. */
export function toTrendSeries(points: readonly TrendPoint[]): SeriesPoint[] {
  return points.map((point) => ({
    label: formatWeekLabel(point.start),
    value: point.best,
  }));
}

/**
 * Turns one exercise's records into the cards the page renders.
 *
 * A record is only produced when the underlying measurement exists: an
 * exercise never logged with a load yields no weight or volume card, and no
 * placeholder is invented for it. Reps are always available, so a bodyweight
 * movement still earns a card.
 */
export function toRecordCards(
  record: ExerciseRecords,
  displayName: string,
): PersonalRecord[] {
  const cards: PersonalRecord[] = [];

  const improvement = (entry: { value: number; previous: number | null }) =>
    entry.previous === null || entry.value <= entry.previous
      ? undefined
      : `+${formatNumber(entry.value - entry.previous)}`;

  // A best of 0 kg is a true measurement — the data layer keeps it — but as a
  // card it tells a bodyweight lifter nothing they did not know. Their reps
  // record below is the meaningful one.
  if (record.maxWeight && record.maxWeight.value > 0) {
    cards.push({
      id: `${record.exerciseSlug}-weight`,
      lift: displayName,
      value: formatNumber(record.maxWeight.value),
      unit: "kg",
      delta: improvement(record.maxWeight),
      achieved: formatRecordDate(record.maxWeight.achievedAt),
      exerciseSlug: record.exerciseSlug,
    });
  }

  if (record.bestReps) {
    cards.push({
      id: `${record.exerciseSlug}-reps`,
      lift: displayName,
      value: formatNumber(record.bestReps.value),
      unit: "reps",
      delta: improvement(record.bestReps),
      achieved: formatRecordDate(record.bestReps.achievedAt),
      exerciseSlug: record.exerciseSlug,
    });
  }

  return cards;
}
