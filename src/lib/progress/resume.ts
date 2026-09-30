/**
 * Which unfinished workout, if any, is worth offering to resume.
 *
 * Pure functions with no database and no clock of their own — "now" is always
 * passed in, so eligibility is reproducible rather than dependent on when it
 * was computed.
 *
 * Why a window at all: nothing deletes or closes abandoned sessions, so a
 * member who once walked away from a workout keeps that row forever. Without a
 * bound, the dashboard would eventually offer to resume something from months
 * ago as though they had just stepped out of the gym. The window decides what
 * still counts as "the session I am in the middle of"; it changes nothing in
 * the database.
 */

/** How recently a session must have started to still be worth resuming. */
export const RESUME_WINDOW_HOURS = 48;

const HOUR_MS = 60 * 60 * 1000;
const RESUME_WINDOW_MS = RESUME_WINDOW_HOURS * HOUR_MS;

/** The fields eligibility is decided from. The caller's row may be wider. */
export type ResumeCandidate = {
  id: string;
  workoutSlug: string;
  /** `workout_sessions.started_at`. */
  startedAt: string;
};

/**
 * The earliest start time still eligible, as an ISO string.
 *
 * Exposed so the query and the check below can share one clock: the cutoff is
 * computed once in the application and used both to filter in SQL and to
 * re-check here, rather than comparing the database's `now()` against the
 * app's.
 */
export function resumeCutoff(now: Date): string {
  return new Date(now.getTime() - RESUME_WINDOW_MS).toISOString();
}

/**
 * Whether a session started recently enough to resume.
 *
 * The boundary is strict: a session started exactly 48 hours ago is **not**
 * eligible. "Within the last 48 hours" is read as an open interval at the far
 * edge, which also makes the rule unambiguous to test.
 *
 * An unreadable timestamp is not eligible. A session whose start cannot be
 * placed in time cannot be shown as "started 3 hours ago", and guessing would
 * be inventing progress.
 */
export function isResumable(startedAt: string, now: Date): boolean {
  const started = Date.parse(startedAt);
  if (Number.isNaN(started)) return false;

  const age = now.getTime() - started;

  // A negative age means the row is stamped in the future — clock skew rather
  // than a stale session, so it is still the session they are in.
  return age < RESUME_WINDOW_MS;
}

/**
 * The newest eligible session from a set of candidates, or null.
 *
 * Scans for the newest *eligible* row rather than trusting the first one. The
 * query already orders newest-first, in which case the head is the answer and
 * anything older is older still — but a row with a corrupt or future
 * `started_at` would break that assumption, and this keeps the choice correct
 * either way.
 *
 * Ties on start time fall to the lexicographically smaller id, so the same
 * inputs always yield the same session.
 */
export function pickResumable<T extends ResumeCandidate>(
  candidates: readonly T[],
  now: Date,
): T | null {
  let best: { row: T; started: number } | null = null;

  for (const row of candidates) {
    if (!row.workoutSlug) continue;
    if (!isResumable(row.startedAt, now)) continue;

    const started = Date.parse(row.startedAt);

    if (
      !best ||
      started > best.started ||
      (started === best.started && row.id.localeCompare(best.row.id) < 0)
    ) {
      best = { row, started };
    }
  }

  return best?.row ?? null;
}

/** Whole hours since a session started, for "picked up 3 hours ago" copy. */
export function hoursSince(startedAt: string, now: Date): number | null {
  const started = Date.parse(startedAt);
  if (Number.isNaN(started)) return null;

  return Math.max(0, Math.floor((now.getTime() - started) / HOUR_MS));
}
