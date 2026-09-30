/**
 * The dashboard's sense of "today".
 *
 * Pure functions with no clock of their own — "now" is passed in, so the label
 * is reproducible and testable.
 *
 * Why UTC: the whole product already defines a day in UTC. `currentLogDate()`
 * keys nutrition, wellness and habits by it; streaks, weekly buckets and
 * history windows are all cut on it. A dashboard date in the reader's local
 * zone would disagree with the streak directly beneath it. No member timezone
 * is stored, so UTC is both the consistent choice and the only one available.
 *
 * The consequence, stated plainly: for a member far from UTC the date can read
 * as the previous or next day for a few hours around midnight. That is the same
 * boundary their logging already uses.
 *
 * There is deliberately no time-of-day greeting here. "Good morning" needs the
 * reader's local hour, and deriving it from UTC would be wrong by up to twelve
 * hours for most of the world — a different false claim rather than a fix.
 */

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/**
 * "Wednesday · 30 Sep" — the real UTC date.
 *
 * Built from the date parts rather than `toLocaleDateString`, which varies with
 * whichever ICU build is running: the same call returns "Sept" on some Node
 * versions and "Sep" on others.
 */
export function formatDashboardDate(now: Date): string {
  if (Number.isNaN(now.getTime())) return "";

  return `${WEEKDAYS[now.getUTCDay()]} · ${now.getUTCDate()} ${MONTHS[now.getUTCMonth()]}`;
}

/**
 * The dashboard greeting.
 *
 * Deliberately time-neutral. A member's first name when one is saved, and
 * nothing invented when it is not — never an email local-part echoed back.
 */
export function formatGreeting(firstName: string | null): string {
  return firstName ? `Welcome back, ${firstName}.` : "Welcome back.";
}
