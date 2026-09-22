// Relative imports rather than the "@/" alias: this module is exercised
// directly by Node's test runner, which has no path mapping.
import { formatRecordDate } from "../progress/view.ts";
import { formatNumber } from "../../lib/format.ts";
import type { SessionVolume } from "../../lib/progress/aggregate.ts";

/**
 * Turns a completed session into the row the history page renders.
 *
 * Presentation only. The volume arrives already recomputed from the member's
 * own sets by `getCompletedSessionHistory`, and nothing here recalculates it —
 * `workout_sessions.total_volume` is not part of `SessionVolume` and so cannot
 * be reached from this file at all.
 *
 * The rules it does enforce are about honesty rather than arithmetic:
 *
 *   * A workout whose slug is no longer in the catalogue keeps its row and
 *     shows the slug. Dropping it would quietly delete a session the member
 *     actually did.
 *   * A set whose load was never recorded still counts as a set, but adds
 *     nothing to the volume. When any such set exists the row says so, because
 *     otherwise the total silently understates the session.
 *   * Absent values read as "—" and never as zero. A session with no stored
 *     duration is not a zero-minute session.
 *
 * Kept free of React and of the workout catalogue so it can be tested
 * directly; the display name is resolved by the caller and passed in.
 */

export type HistoryItem = {
  id: string;
  /** Catalogue name, or the raw slug when the workout is no longer listed. */
  name: string;
  /** True when the name above is a fallback slug rather than a real title. */
  unknownWorkout: boolean;
  completedAt: string;
  /** "20 Sep 2026 · 10:02" — UTC, matching the rest of the progress system. */
  completedLabel: string;
  /** "1h 02m", "45 min", or "—" when no duration was stored. */
  durationLabel: string;
  /** Every set logged, including any whose load was not recorded. */
  sets: number;
  /** Sets left out of the volume because no weight was recorded. */
  unmeasuredSets: number;
  volume: number;
  volumeLabel: string;
  /**
   * Link to start this workout again. Absent when the workout has left the
   * catalogue, because there is no current plan left to repeat.
   */
  repeatHref: string | null;
};

/**
 * "1h 02m" past an hour, "45 min" below it, "—" when nothing was stored.
 *
 * Null and zero are different: a session can legitimately be logged with no
 * duration, and showing that as "0 min" would state something untrue.
 */
export function formatDuration(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds) || seconds <= 0) return "—";

  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  return `${hours}h ${String(minutes % 60).padStart(2, "0")}m`;
}

/** "20 Sep 2026 · 10:02" in UTC, or just the date if the time is unreadable. */
export function formatSessionTimestamp(iso: string): string {
  const moment = new Date(iso);
  if (Number.isNaN(moment.getTime())) return "";

  const hours = String(moment.getUTCHours()).padStart(2, "0");
  const minutes = String(moment.getUTCMinutes()).padStart(2, "0");

  return `${formatRecordDate(iso)} · ${hours}:${minutes}`;
}

/**
 * One history row.
 *
 * `displayName` is null when the slug is not in the catalogue, which is the
 * only case that produces a fallback name.
 */
export function toHistoryItem(
  session: SessionVolume,
  displayName: string | null,
): HistoryItem {
  const unknownWorkout = displayName === null;

  return {
    id: session.id,
    name: unknownWorkout ? session.workoutSlug : displayName,
    unknownWorkout,
    completedAt: session.completedAt,
    completedLabel: formatSessionTimestamp(session.completedAt),
    durationLabel: formatDuration(session.durationSeconds),
    sets: session.countedSets + session.excludedSets,
    unmeasuredSets: session.excludedSets,
    volume: session.volume,
    volumeLabel: `${formatNumber(session.volume)} kg`,
    repeatHref: unknownWorkout
      ? null
      : `/workouts/${session.workoutSlug}/start?from=${session.id}`,
  };
}
