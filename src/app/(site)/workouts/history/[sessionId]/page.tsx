import { ArrowLeft, CalendarDays, Clock, Layers, ListChecks, RotateCcw } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHero } from "@/components/ui/PageHero";
import { buildDetailExercises } from "@/components/workouts/session-detail-view";
import { toHistoryItem } from "@/components/workouts/history-view";
import { getExercise } from "@/data/exercises";
import { getWorkout } from "@/data/workouts";
import { getSessionDetail } from "@/lib/data/progress-analytics";

export const metadata: Metadata = {
  title: "Session Detail",
  description: "One completed workout, with every set you logged.",
};

/**
 * A single completed session.
 *
 * Fetched directly by id rather than looked up in the history list, so a
 * session older than the list's cap is still reachable by its own link.
 *
 * Ownership is settled inside `getSessionDetail`: the member comes from the
 * session, the query is scoped to them, and RLS enforces the same rule again.
 * A session that belongs to someone else is indistinguishable from one that
 * does not exist — both reach `notFound()` — so an id cannot be probed to find
 * out whether it is real.
 */
export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const { data, error } = await getSessionDetail(sessionId);

  if (error) {
    return (
      <>
        <PageHero eyebrow="History" title="Session." />
        <section className="py-12 lg:py-16">
          <Container>
            <ErrorState
              title="We couldn't load this session."
              description="Your training history is safe — we just couldn't read it this time. Refreshing usually clears it."
            />
          </Container>
        </section>
      </>
    );
  }

  if (!data) notFound();

  const workout = getWorkout(data.session.workoutSlug);
  const item = toHistoryItem(data.session, workout?.title ?? null);

  // Catalogue plan first, then the order recorded on the session. Both can be
  // absent — the session-exercise insert is non-fatal when a workout starts —
  // in which case the order the sets were performed carries the page.
  const plannedOrder =
    workout?.exercises.map((exercise) => exercise.exerciseSlug ?? exercise.id) ??
    data.plannedSlugs;

  const exercises = buildDetailExercises(
    data.sets,
    plannedOrder,
    (slug) => getExercise(slug)?.name ?? null,
  );

  const stats = [
    { label: "Completed", value: item.completedLabel, icon: CalendarDays },
    { label: "Duration", value: item.durationLabel, icon: Clock },
    { label: "Sets", value: String(item.sets), icon: ListChecks },
    { label: "Volume", value: item.volumeLabel, icon: Layers },
  ];

  return (
    <>
      <PageHero
        eyebrow="History"
        title={item.name}
        description={
          item.unknownWorkout
            ? "This workout is no longer in the catalogue, but the session you trained is unchanged."
            : "Every set you logged in this session."
        }
      />

      <section className="py-12 lg:py-16">
        <Container>
          <div className="mb-10 flex flex-wrap gap-3">
            <Button href="/workouts/history" variant="secondary">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to History
            </Button>

            {/* Starts a NEW session of the current workout, with the set
                logger offering what was lifted here. The session below is
                never touched. Hidden when the workout has left the catalogue,
                since there is no current plan to repeat. */}
            {workout ? (
              <Button href={`/workouts/${workout.slug}/start?from=${data.session.id}`}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Repeat Workout
              </Button>
            ) : null}
          </div>

          {/* Session summary */}
          <Card tone="raised" className="p-6">
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-fog flex items-center gap-1.5 text-[9px] font-semibold tracking-[0.16em] uppercase">
                    <stat.icon className="h-3 w-3" aria-hidden="true" />
                    {stat.label}
                  </dt>
                  <dd className="text-chalk mt-1.5 text-sm font-semibold tabular-nums">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>

            {item.unmeasuredSets > 0 ? (
              <p className="text-fog border-chalk/8 mt-5 border-t pt-4 text-xs leading-relaxed">
                {item.unmeasuredSets}{" "}
                {item.unmeasuredSets === 1 ? "set was" : "sets were"} logged without a
                weight, so {item.unmeasuredSets === 1 ? "it is" : "they are"} counted
                above but not included in the volume.
              </p>
            ) : null}
          </Card>

          {/* Exercises */}
          {exercises.length === 0 ? (
            <Card tone="raised" className="mt-6 p-6">
              <p className="text-mist text-sm leading-relaxed">
                No sets were logged in this session. It was finished, but nothing was
                recorded against it.
              </p>
            </Card>
          ) : (
            <ul className="mt-6 grid gap-5">
              {exercises.map((exercise) => (
                <li key={exercise.exerciseSlug}>
                  <Card tone="raised" className="p-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                      <h2 className="font-display text-chalk text-xl">{exercise.name}</h2>

                      <p className="text-fog text-[10px] font-semibold tracking-[0.16em] uppercase">
                        {exercise.skipped
                          ? "Not logged"
                          : `${exercise.sets.length} ${
                              exercise.sets.length === 1 ? "set" : "sets"
                            } · ${exercise.volumeLabel}`}
                      </p>
                    </div>

                    {exercise.unknownExercise ? (
                      <p className="text-fog mt-2 text-xs">
                        No longer in the exercise library.
                      </p>
                    ) : null}

                    {exercise.skipped ? (
                      // Planned, never performed. No row is invented for it.
                      <p className="text-mist border-chalk/8 mt-4 border-t pt-4 text-sm leading-relaxed">
                        Planned for this session but no sets were recorded.
                      </p>
                    ) : (
                      <table className="mt-4 w-full text-sm">
                        <caption className="sr-only">
                          Sets logged for {exercise.name}
                        </caption>
                        <thead>
                          <tr className="text-fog border-chalk/8 border-b text-[9px] font-semibold tracking-[0.16em] uppercase">
                            <th scope="col" className="py-2 text-left font-semibold">
                              Set
                            </th>
                            <th scope="col" className="py-2 text-right font-semibold">
                              Load
                            </th>
                            <th scope="col" className="py-2 text-right font-semibold">
                              Reps
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-chalk/8 divide-y">
                          {exercise.sets.map((set) => (
                            <tr key={set.setNumber} className="text-chalk">
                              <th
                                scope="row"
                                className="text-fog py-2.5 text-left text-xs font-semibold"
                              >
                                {set.setNumber}
                              </th>
                              <td className="py-2.5 text-right tabular-nums">
                                {set.loadLabel}
                              </td>
                              <td className="py-2.5 text-right tabular-nums">
                                {set.repsLabel}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>
    </>
  );
}
