/**
 * The log date used by every day-scoped record.
 *
 * nutrition_logs, wellness_logs and habit_completions are keyed by a plain
 * `date` column, so reads and writes must agree on what "today" means. The
 * server decides, and the client never supplies a date — if it did, a member
 * whose local date differs from the server's would save to one day and read
 * back another, and their entry would appear to vanish.
 *
 * The consequence is that the day boundary is UTC. Making it follow each
 * member's own midnight needs a stored timezone preference, which is a
 * separate concern from persistence.
 */
export function currentLogDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Formats a log date for display, e.g. "Sat 13 Sep". */
export function formatLogDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}
