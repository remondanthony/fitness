/**
 * Cursors and filters for the workout history list.
 *
 * Pure functions with no database and no clock of their own. Everything here
 * parses values that arrive from the URL, which is why each one validates
 * rather than trusts:
 *
 * The cursor and the filters are interpolated into PostgREST filter strings by
 * the data layer. A cursor carrying a comma, a parenthesis or a quote could
 * change the shape of that filter rather than its values, so nothing reaches
 * the query until it has matched a strict pattern here. Anything malformed
 * becomes null — the first page, unfiltered — instead of an error, because a
 * bad link should show a sensible list rather than a failure.
 */

/** A position in the history list: the last row of the previous page. */
export type Cursor = {
  /** `completed_at` of that row. */
  completedAt: string;
  /** Its session id, which breaks ties between sessions sharing a timestamp. */
  id: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Catalogue slugs are lowercase words joined by hyphens. */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** "<iso>~<uuid>" — readable in a URL, and trivially validated on the way back. */
export function encodeCursor(cursor: Cursor): string {
  return `${cursor.completedAt}~${cursor.id}`;
}

/**
 * Reads a cursor from a query parameter.
 *
 * Returns null for anything that is not exactly a timestamp and a uuid, which
 * is what keeps a hand-edited cursor from reaching the query as anything other
 * than two well-formed values.
 */
export function parseCursor(raw: string | undefined | null): Cursor | null {
  if (!raw) return null;

  const separator = raw.lastIndexOf("~");
  if (separator <= 0) return null;

  const completedAt = raw.slice(0, separator);
  const id = raw.slice(separator + 1);

  if (!UUID.test(id)) return null;

  const parsed = Date.parse(completedAt);
  if (Number.isNaN(parsed)) return null;

  // Normalised, so the value sent to the database is one this module produced
  // rather than whatever spelling arrived.
  return { completedAt: new Date(parsed).toISOString(), id };
}

export type HistoryFilters = {
  /** Inclusive UTC date, "2026-09-01", or null. */
  from: string | null;
  /** Inclusive UTC date. The query covers the whole of this day. */
  to: string | null;
  workoutSlug: string | null;
};

export const NO_FILTERS: HistoryFilters = { from: null, to: null, workoutSlug: null };

function validDate(raw: string | undefined | null): string | null {
  if (!raw || !ISO_DATE.test(raw)) return null;

  // Rejects "2026-02-31" and friends, which match the shape but are not days.
  const parsed = new Date(`${raw}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  if (parsed.toISOString().slice(0, 10) !== raw) return null;

  return raw;
}

/**
 * Reads the filters from query parameters.
 *
 * A reversed range is corrected rather than refused: someone who picks the
 * dates the wrong way round means the period between them, and returning
 * nothing would look like an absence of training.
 */
export function normaliseFilters(raw: {
  from?: string | null;
  to?: string | null;
  workout?: string | null;
}): HistoryFilters {
  let from = validDate(raw.from);
  let to = validDate(raw.to);

  if (from && to && from > to) [from, to] = [to, from];

  const workout = raw.workout?.trim() ?? "";
  const workoutSlug = workout && SLUG.test(workout) && workout.length <= 120 ? workout : null;

  return { from, to, workoutSlug };
}

/** True when any filter is set, which is what distinguishes "no results for
 *  this filter" from "no history at all". */
export function filtersAreActive(filters: HistoryFilters): boolean {
  return filters.from !== null || filters.to !== null || filters.workoutSlug !== null;
}

/**
 * The inclusive instant range a date filter covers.
 *
 * `to` is expanded to the end of that day so a single-day filter finds the
 * sessions inside it; UTC throughout, matching the rest of the progress system.
 */
export function filterRange(filters: HistoryFilters): {
  fromIso: string | null;
  toIso: string | null;
} {
  return {
    fromIso: filters.from ? `${filters.from}T00:00:00.000Z` : null,
    toIso: filters.to ? `${filters.to}T23:59:59.999Z` : null,
  };
}

/**
 * Filters as a query string, for links that must keep them.
 *
 * Deliberately omits the cursor: a link built from filters is a link to the
 * first page of those filters, which is what makes changing a filter reset the
 * list rather than resuming someone else's position in it.
 */
export function filtersToQuery(filters: HistoryFilters): string {
  const params = new URLSearchParams();

  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.workoutSlug) params.set("workout", filters.workoutSlug);

  const query = params.toString();
  return query ? `?${query}` : "";
}
