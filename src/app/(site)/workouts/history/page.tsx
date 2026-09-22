import { ArrowLeft, History } from "lucide-react";
import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHero } from "@/components/ui/PageHero";
import { HistoryFilters } from "@/components/workouts/HistoryFilters";
import { HistoryLoadMore } from "@/components/workouts/HistoryLoadMore";
import { SessionHistoryCard } from "@/components/workouts/SessionHistoryCard";
import { toHistoryItem } from "@/components/workouts/history-view";
import { getWorkout, workouts } from "@/data/workouts";
import { getSessionPage } from "@/lib/data/progress-analytics";
import {
  filtersAreActive,
  normaliseFilters,
} from "@/lib/progress/history-query";

export const metadata: Metadata = {
  title: "Workout History",
  description: "Every workout you have finished, with the sets and volume you logged.",
};

/**
 * Workout history.
 *
 * Only the member's own finished sessions, and only what they actually logged.
 * Volume is recomputed from `exercise_logs` by the data layer; the stored
 * `total_volume` column is never read. Ownership comes from the session inside
 * that helper, so no user id passes through this page.
 */
export default async function WorkoutHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; workout?: string }>;
}) {
  const raw = await searchParams;

  // Parsed, never trusted: anything malformed becomes "no filter" rather than
  // reaching the query. No cursor is read here — the first page is always the
  // first page, which is what makes a filter change reset the list.
  const filters = normaliseFilters(raw);
  const active = filtersAreActive(filters);

  const { data, error } = await getSessionPage({ filters });

  // The catalogue owns the name; a slug it no longer lists keeps its row and
  // falls back to the slug rather than disappearing from the member's history.
  const items = data.sessions.map((session) =>
    toHistoryItem(session, getWorkout(session.workoutSlug)?.title ?? null),
  );

  return (
    <>
      <PageHero
        eyebrow="History"
        title="Workout History."
        description="Every session you have finished, newest first, with the sets and volume you logged."
      />

      <section className="py-12 lg:py-16">
        <Container>
          <div className="mb-10">
            <Button href="/workouts" variant="secondary">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Workouts
            </Button>
          </div>

          <div className="mb-8">
            <HistoryFilters
              filters={filters}
              workouts={workouts.map((workout) => ({
                slug: workout.slug,
                title: workout.title,
              }))}
              active={active}
            />
          </div>

          {error ? (
            // A failed read is not an empty history. Telling a member with
            // months of training that they have none would be worse than
            // saying nothing.
            <ErrorState
              title="We couldn't load your history."
              description="Your sessions are safe — we just couldn't read them this time. Refreshing usually clears it."
            />
          ) : items.length === 0 ? (
            // "Nothing matches this filter" and "nothing logged yet" are
            // different facts, and only one of them is about the member.
            active ? (
              <EmptyState
                icon={History}
                title="No sessions match these filters"
                description="Try a wider date range, or a different workout."
                action={
                  <Button href="/workouts/history" variant="secondary">
                    Clear Filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={History}
                title="No completed workouts yet"
                description="Finish a session and it appears here, with the date, duration, sets and volume you actually logged."
                action={
                  <Button href="/workouts" variant="secondary">
                    Browse Workouts
                  </Button>
                }
              />
            )
          ) : (
            <>
              <ul className="grid gap-5">
                {items.map((item) => (
                  <li key={item.id}>
                    <SessionHistoryCard item={item} />
                  </li>
                ))}
              </ul>

              {data.nextCursor ? (
                <HistoryLoadMore
                  initialCursor={data.nextCursor}
                  filters={{
                    from: filters.from ?? undefined,
                    to: filters.to ?? undefined,
                    workout: filters.workoutSlug ?? undefined,
                  }}
                />
              ) : null}
            </>
          )}
        </Container>
      </section>
    </>
  );
}
