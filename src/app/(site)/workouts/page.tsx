import { ArrowRight, History, Sparkles } from "lucide-react";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WorkoutCard } from "@/components/workouts/WorkoutCard";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getWorkout,
  recommendedWorkouts,
  todaysWorkout,
  totalSets,
  type Workout,
} from "@/data/workouts";
import { getCompletedSessionHistory } from "@/lib/data/progress-analytics";

export const metadata: Metadata = {
  title: "Workouts",
  description:
    "Your session for today, what you have trained recently and what to do next.",
};

/**
 * Turns a stored session into the shape the existing recent card renders.
 *
 * `volume` arrives already recomputed from the member's own sets. The stored
 * `workout_sessions.total_volume` column is written by the browser at the end
 * of a session and has never been reconciled against those sets, so it is not
 * read here or anywhere else in the history representation.
 */
function toRecentCard(session: {
  workoutSlug: string;
  completedAt: string;
  durationSeconds: number | null;
  volume: number;
  countedSets: number;
  excludedSets: number;
}): Workout | null {
  const workout = getWorkout(session.workoutSlug);
  if (!workout) return null;

  return {
    ...workout,
    lastCompleted: {
      date: relativeDay(session.completedAt),
      minutes: Math.max(1, Math.round((session.durationSeconds ?? 0) / 60)),
      volumeKg: Math.round(session.volume),
      // Every set logged, including any whose load was not recorded and so
      // could not contribute to the volume above.
      sets: session.countedSets + session.excludedSets,
    },
  };
}

/** "Today", "Yesterday", "3 days ago" — matching the existing card copy. */
function relativeDay(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "Last week";
  return `${Math.floor(days / 7)} weeks ago`;
}

export default async function WorkoutsPage() {
  // Real history when the member has trained; the sample shelf until then.
  // Real sessions only. A member with nothing logged sees an empty state
  // rather than a sample list: an invented history on the page that shows what
  // you have trained is the one place a placeholder cannot be harmless.
  const { data: completed, error: historyError } = await getCompletedSessionHistory(3);
  const history = completed
    .map(toRecentCard)
    .filter((entry): entry is Workout => entry !== null);

  return (
    <>
      <PageHero
        eyebrow="Workouts"
        title="Today's Training."
        description="One session, already planned. Start it when you are ready — everything else can wait."
      />

      {/* Today's workout */}
      <section className="py-14 lg:py-20">
        <Container>
          <Card tone="raised" flush className="overflow-hidden rounded-3xl">
            <div className="grid lg:grid-cols-12">
              <div className="relative lg:col-span-5">
                {/* Ratio-driven on mobile, stretched to the row height from lg up. */}
                <ImagePlaceholder
                  variant={todaysWorkout.artwork}
                  aspect="photo"
                  alt={`${todaysWorkout.title} artwork`}
                  className="w-full rounded-none border-0 lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"
                />
                <div
                  className="from-ink-800 pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t to-transparent lg:inset-y-0 lg:right-0 lg:left-auto lg:h-auto lg:w-24 lg:bg-gradient-to-l"
                  aria-hidden="true"
                />
              </div>

              <div className="flex flex-col justify-center p-7 sm:p-10 lg:col-span-7">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="accent" className="gap-2">
                    <span
                      className="bg-accent-500 h-1.5 w-1.5 rounded-full"
                      aria-hidden="true"
                    />
                    Today
                  </Badge>
                  <Badge variant="outline">{todaysWorkout.level}</Badge>
                </div>

                <h2 className="font-display text-chalk mt-6 text-4xl sm:text-5xl lg:text-6xl">
                  {todaysWorkout.title}
                </h2>

                <p className="text-mist mt-5 max-w-lg text-sm leading-relaxed sm:text-base">
                  {todaysWorkout.summary}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                  <p className="flex items-baseline gap-2">
                    <span className="font-display text-chalk text-4xl">
                      {todaysWorkout.estimatedMinutes}
                    </span>
                    <span className="text-fog text-[11px] font-semibold tracking-[0.2em] uppercase">
                      Min
                    </span>
                  </p>
                  <p className="flex items-baseline gap-2">
                    <span className="font-display text-chalk text-4xl">
                      {todaysWorkout.exercises.length}
                    </span>
                    <span className="text-fog text-[11px] font-semibold tracking-[0.2em] uppercase">
                      Exercises
                    </span>
                  </p>
                  <p className="flex items-baseline gap-2">
                    <span className="font-display text-chalk text-4xl">
                      {totalSets(todaysWorkout)}
                    </span>
                    <span className="text-fog text-[11px] font-semibold tracking-[0.2em] uppercase">
                      Sets
                    </span>
                  </p>
                </div>

                <div className="border-chalk/8 mt-8 border-t pt-6">
                  <p className="text-fog text-[10px] font-semibold tracking-[0.2em] uppercase">
                    Target Muscles
                  </p>
                  <p className="text-chalk mt-2 text-sm font-semibold">
                    {todaysWorkout.targetMuscles.join(" · ")}
                  </p>
                </div>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button
                    href={`/workouts/${todaysWorkout.slug}/start`}
                    size="lg"
                    pendingLabel="Starting…"
                  >
                    Start Workout
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                      aria-hidden="true"
                    />
                  </Button>
                  <Button
                    href={`/workouts/${todaysWorkout.slug}`}
                    size="lg"
                    variant="secondary"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </Container>
      </section>

      {/* Recent */}
      <section className="border-chalk/8 bg-ink-900 border-y py-16 lg:py-20">
        <Container>
          <SectionHeading
            size="md"
            eyebrow="History"
            title={
              <span className="flex items-center gap-4">
                <History className="text-accent-500 h-7 w-7" aria-hidden="true" />
                Recent Workouts
              </span>
            }
            description="Your completed sessions, newest first."
            action={
              <Button href="/workouts/history" variant="secondary" className="hidden md:inline-flex">
                View All
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                  aria-hidden="true"
                />
              </Button>
            }
          />

          {history.length === 0 ? (
            <div className="mt-12">
              <EmptyState
                icon={History}
                title={
                  historyError
                    ? "We couldn't load your history"
                    : "No completed workouts yet"
                }
                description={
                  historyError
                    ? "Your sessions are safe — we just couldn't read them this time. Refreshing usually clears it."
                    : "Finish a session and it appears here, with the time, sets and volume you actually logged."
                }
              />
            </div>
          ) : (
            <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {history.map((workout, index) => (
                <li key={`${workout.slug}-${index}`}>
                  <WorkoutCard workout={workout} variant="recent" index={index} />
                </li>
              ))}
            </ul>
          )}

          {history.length > 0 ? (
            <div className="mt-10 flex justify-center md:hidden">
              <Button href="/workouts/history" variant="secondary">
                View All History
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ) : null}
        </Container>
      </section>

      {/* Recommended */}
      <section className="py-16 lg:py-24">
        <Container>
          <SectionHeading
            size="md"
            eyebrow="Up Next"
            title={
              <span className="flex items-center gap-4">
                <Sparkles className="text-accent-500 h-7 w-7" aria-hidden="true" />
                Recommended Workouts
              </span>
            }
            description="Picked to balance what you have already done this week."
          />

          <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recommendedWorkouts.map((workout, index) => (
              <li key={workout.slug}>
                <WorkoutCard workout={workout} index={index} />
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
