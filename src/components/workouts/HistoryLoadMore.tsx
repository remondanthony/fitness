"use client";

import { useState } from "react";

import { SessionHistoryCard } from "@/components/workouts/SessionHistoryCard";
import type { HistoryItem } from "@/components/workouts/history-view";
import { loadMoreHistoryAction } from "@/lib/actions/history";

/**
 * Appends older sessions to the history list.
 *
 * The first page is server-rendered above this component; everything it
 * fetches is added below, so loading more never costs the list already on
 * screen. The cursor and filters are sent back as opaque strings and re-parsed
 * on the server — the browser is telling the server where it got to, not who
 * it is.
 */
export function HistoryLoadMore({
  initialCursor,
  filters,
}: {
  initialCursor: string;
  filters: { from?: string; to?: string; workout?: string };
}) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function loadMore() {
    if (!cursor || pending) return;

    setPending(true);
    setError(undefined);

    const result = await loadMoreHistoryAction({ cursor, ...filters });

    setPending(false);

    if (result.status === "error") {
      setError(result.message);
      return;
    }

    // Guard against a repeated cursor ever duplicating a row on screen.
    setItems((current) => {
      const seen = new Set(current.map((item) => item.id));
      return [...current, ...result.items.filter((item) => !seen.has(item.id))];
    });
    setCursor(result.nextCursor);
  }

  return (
    <>
      {items.length > 0 ? (
        <ul className="mt-5 grid gap-5">
          {items.map((item) => (
            <li key={item.id}>
              <SessionHistoryCard item={item} />
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-10 flex flex-col items-center gap-3">
        {error ? (
          <p className="text-fog text-sm" role="status">
            {error}
          </p>
        ) : null}

        {cursor ? (
          <button
            type="button"
            onClick={loadMore}
            disabled={pending}
            className="border-chalk/15 bg-chalk/5 text-chalk hover:border-chalk/30 hover:bg-chalk/10 inline-flex h-12 items-center justify-center rounded-full border px-7 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-60"
          >
            {pending ? "Loading…" : "Load older sessions"}
          </button>
        ) : (
          <p className="text-fog text-xs" role="status">
            That&rsquo;s your whole history.
          </p>
        )}
      </div>
    </>
  );
}
