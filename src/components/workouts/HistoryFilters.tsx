import { Filter, X } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/Card";
import type { HistoryFilters as Filters } from "@/lib/progress/history-query";

/**
 * Date-range and workout filters for the history list.
 *
 * A plain GET form, so applying a filter is a navigation: the URL carries the
 * state, the page is shareable and refreshable, and the cursor is dropped
 * simply by not being in the form — which is what makes changing a filter
 * start the list again rather than resume someone else's position in it.
 */
export function HistoryFilters({
  filters,
  workouts,
  active,
}: {
  filters: Filters;
  workouts: { slug: string; title: string }[];
  active: boolean;
}) {
  const field =
    "border-chalk/15 bg-ink-950/60 text-chalk focus-visible:border-accent-500/60 focus-visible:ring-accent-500/25 h-11 w-full rounded-xl border px-3 text-sm outline-none transition-colors focus-visible:ring-2";
  const label = "text-fog text-[10px] font-semibold tracking-[0.16em] uppercase";

  return (
    <Card tone="raised" className="p-5">
      <form method="get" className="flex flex-col gap-4">
        <p className="text-fog flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase">
          <Filter className="h-3.5 w-3.5" aria-hidden="true" />
          Filter
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <label className={label} htmlFor="history-from">
              From
            </label>
            <input
              id="history-from"
              type="date"
              name="from"
              defaultValue={filters.from ?? ""}
              className={field}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={label} htmlFor="history-to">
              To
            </label>
            <input
              id="history-to"
              type="date"
              name="to"
              defaultValue={filters.to ?? ""}
              className={field}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={label} htmlFor="history-workout">
              Workout
            </label>
            <select
              id="history-workout"
              name="workout"
              defaultValue={filters.workoutSlug ?? ""}
              className={field}
            >
              <option value="">All workouts</option>
              {workouts.map((workout) => (
                <option key={workout.slug} value={workout.slug}>
                  {workout.title}
                </option>
              ))}
              {/* A filtered slug the catalogue no longer lists stays selectable,
                  so refreshing a shared link does not silently drop it. */}
              {filters.workoutSlug &&
              !workouts.some((workout) => workout.slug === filters.workoutSlug) ? (
                <option value={filters.workoutSlug}>{filters.workoutSlug}</option>
              ) : null}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="bg-accent-500 hover:bg-accent-400 inline-flex h-11 flex-1 items-center justify-center rounded-xl text-sm font-semibold text-white transition-colors"
            >
              Apply
            </button>

            {active ? (
              <Link
                href="/workouts/history"
                className="border-chalk/15 bg-chalk/5 text-fog hover:text-chalk inline-flex h-11 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition-colors"
                aria-label="Clear filters"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </div>
      </form>
    </Card>
  );
}
