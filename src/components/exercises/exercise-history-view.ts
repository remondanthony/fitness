// Relative imports rather than the "@/" alias: this module is exercised
// directly by Node's test runner, which has no path mapping.
import { toSetRow, type DetailSetRow } from "../workouts/session-detail-view.ts";
import { formatRecordDate } from "../progress/view.ts";
import { formatNumber } from "../../lib/format.ts";
import type {
  ExerciseHistory,
  ExerciseSessionEntry,
} from "../../lib/data/progress-analytics.ts";

/**
 * Turns one exercise's logged history into the rows its page renders.
 *
 * Presentation only. The sets arrive already scoped to the member, and the
 * records arrive from `buildExerciseRecords` — the same engine behind the
 * progress page, so this file computes no record of its own.
 *
 * The set rules are shared with the session-detail view rather than restated:
 * a null weight shows a dash and adds nothing to volume, a zero weight is a
 * real bodyweight set, and both still count as sets.
 */

export type ExerciseSessionRow = {
  sessionId: string;
  /** Catalogue title, or the slug when the workout is no longer listed. */
  workoutName: string;
  unknownWorkout: boolean;
  completedAt: string;
  completedLabel: string;
  sets: DetailSetRow[];
  volume: number;
  volumeLabel: string;
  /** Sets whose load was not recorded, so the volume understates them. */
  unmeasuredSets: number;
};

export type RecordRow = { label: string; value: string; achieved: string };

/** One past session, with its sets ordered by set number. */
export function toExerciseSessionRow(
  entry: ExerciseSessionEntry,
  workoutName: string | null,
): ExerciseSessionRow {
  const sets = [...entry.sets]
    .map(toSetRow)
    .sort((a, b) => a.setNumber - b.setNumber);

  const volume = Math.round(
    sets.reduce((total, set) => total + (set.volume ?? 0), 0) * 100,
  ) / 100;

  return {
    sessionId: entry.sessionId,
    workoutName: workoutName ?? entry.workoutSlug,
    unknownWorkout: workoutName === null,
    completedAt: entry.completedAt,
    completedLabel: formatRecordDate(entry.completedAt),
    sets,
    volume,
    volumeLabel: `${formatNumber(volume)} kg`,
    unmeasuredSets: sets.filter((set) => set.volume === null).length,
  };
}

/**
 * The record cards for this exercise.
 *
 * Only records the logs actually support: an exercise never logged with a load
 * yields no weight or volume record, and none is invented to fill the row. A
 * best of 0 kg is dropped for the same reason it is on the progress page — it
 * is true, but it tells a bodyweight lifter nothing.
 */
export function toRecordRows(records: ExerciseHistory["records"]): RecordRow[] {
  if (!records) return [];

  const rows: RecordRow[] = [];

  if (records.maxWeight && records.maxWeight.value > 0) {
    rows.push({
      label: "Heaviest Set",
      value: `${formatNumber(records.maxWeight.value)} kg`,
      achieved: formatRecordDate(records.maxWeight.achievedAt),
    });
  }

  if (records.bestReps) {
    rows.push({
      label: "Most Reps",
      value: `${formatNumber(records.bestReps.value)}`,
      achieved: formatRecordDate(records.bestReps.achievedAt),
    });
  }

  if (records.bestSetVolume && records.bestSetVolume.value > 0) {
    rows.push({
      label: "Best Set Volume",
      value: `${formatNumber(records.bestSetVolume.value)} kg`,
      achieved: formatRecordDate(records.bestSetVolume.achievedAt),
    });
  }

  return rows;
}

export type ExerciseHistorySummary = {
  sessionCount: number;
  totalSets: number;
  totalVolume: number;
  totalVolumeLabel: string;
  hasHistory: boolean;
};

/** Totals across every session, added up from rows already computed. */
export function summariseExerciseHistory(
  rows: readonly ExerciseSessionRow[],
): ExerciseHistorySummary {
  const totalSets = rows.reduce((total, row) => total + row.sets.length, 0);
  const totalVolume =
    Math.round(rows.reduce((total, row) => total + row.volume, 0) * 100) / 100;

  return {
    sessionCount: rows.length,
    totalSets,
    totalVolume,
    totalVolumeLabel: `${formatNumber(totalVolume)} kg`,
    hasHistory: rows.length > 0,
  };
}
