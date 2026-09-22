"use server";

import { toHistoryItem, type HistoryItem } from "@/components/workouts/history-view";
import { getWorkout } from "@/data/workouts";
import { getSessionPage } from "@/lib/data/progress-analytics";
import { normaliseFilters, parseCursor } from "@/lib/progress/history-query";

/**
 * The next page of workout history.
 *
 * Called by the "Load more" control so older sessions append to the list
 * instead of replacing it. Everything the browser sends is a position and a
 * filter — never an identity: ownership comes from the session inside
 * `getSessionPage`, and the cursor and filters are re-parsed here rather than
 * trusted, exactly as they are on first render.
 */

export type LoadMoreResult =
  | { status: "ok"; items: HistoryItem[]; nextCursor: string | null }
  | { status: "error"; message: string };

export async function loadMoreHistoryAction(input: {
  cursor: string;
  from?: string;
  to?: string;
  workout?: string;
}): Promise<LoadMoreResult> {
  const cursor = parseCursor(input.cursor);

  // Without a usable cursor there is no "next" to fetch. Returning the first
  // page again would silently duplicate what is already on screen.
  if (!cursor) {
    return { status: "error", message: "We couldn't load any more sessions." };
  }

  const filters = normaliseFilters({
    from: input.from,
    to: input.to,
    workout: input.workout,
  });

  const { data, error } = await getSessionPage({ cursor, filters });

  if (error) {
    return { status: "error", message: "We couldn't load any more sessions." };
  }

  return {
    status: "ok",
    items: data.sessions.map((session) =>
      toHistoryItem(session, getWorkout(session.workoutSlug)?.title ?? null),
    ),
    nextCursor: data.nextCursor,
  };
}
