import { ArrowLeft, History, Layers, ListChecks, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  summariseExerciseHistory,
  toExerciseSessionRow,
  toRecordRows,
} from "@/components/exercises/exercise-history-view";
import { getExercise } from "@/data/exercises";
import { getWorkout } from "@/data/workouts";
import { getExerciseHistory } from "@/lib/data/progress-analytics";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = getExercise(slug)?.name ?? slug;

  return {
    title: `${name} History`,
    description: `Every set you have logged for ${name}.`,
  };
}

/**
 * One exercise, across every session it appears in.
 *
 * The slug in the URL is a catalogue key, not an ownership claim: the query is
 * scoped to the member by their session and by RLS, so it can only ever return
 * the caller's own logs. No user id passes through this page.
 *
 * An exercise the library no longer lists still has a page. The member trained
 * it, so its history is theirs whether or not the catalogue still carries it.
 */
export default async function ExerciseHistoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const exercise = getExercise(slug);
  const { data, error } = await getExerciseHistory(slug);

  const rows = data.sessions.map((entry) =>
    toExerciseSessionRow(entry, getWorkout(entry.workoutSlug)?.title ?? null),
  );
  const summary = summariseExerciseHistory(rows);
  const records = toRecordRows(data.records);

  const name = exercise?.name ?? slug;

  return (
    <>
      <PageHero
        eyebrow="Exercise History"
        title={name}
        description={
          exercise
            ? "Every set you have logged for this exercise, newest session first."
            : "This exercise is no longer in the library, but the sets you logged are unchanged."
        }
      />

      <section className="py-12 lg:py-16">
        <Container>
          <div className="mb-10 flex flex-wrap gap-3">
            {exercise ? (
              <Button href={`/exercises/${slug}`} variant="secondary">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to {name}
              </Button>
            ) : (
              <Button href="/exercises" variant="secondary">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Browse Exercises
              </Button>
            )}
          </div>

          {error ? (
            // A failed read is not an absence of training.
            <ErrorState
              title="We couldn't load this exercise history."
              description="Your logged sets are safe — we just couldn't read them this time. Refreshing usually clears it."
            />
          ) : !summary.hasHistory ? (
            <EmptyState
              icon={History}
              title={`No sets logged for ${name} yet`}
              description="Log this exercise during a workout and every set you record will appear here, with your best ever."
              action={
                <Button href="/workouts" variant="secondary">
                  Browse Workouts
                </Button>
              }
            />
          ) : (
            <>
              {/* Totals */}
              <dl className="grid gap-5 sm:grid-cols-3">
                {[
                  {
                    label: "Sessions",
                    value: String(summary.sessionCount),
                    icon: History,
                  },
                  { label: "Sets", value: String(summary.totalSets), icon: ListChecks },
                  {
                    label: "Total Volume",
                    value: summary.totalVolumeLabel,
                    icon: Layers,
                  },
                ].map((stat) => (
                  <Card key={stat.label} tone="raised" className="p-6">
                    <dt className="text-fog flex items-center gap-1.5 text-[9px] font-semibold tracking-[0.16em] uppercase">
                      <stat.icon className="h-3 w-3" aria-hidden="true" />
                      {stat.label}
                    </dt>
                    <dd className="font-display text-chalk mt-2 text-3xl tabular-nums">
                      {stat.value}
                    </dd>
                  </Card>
                ))}
              </dl>

              {/* Records — the same engine as the progress page, not a second one. */}
              {records.length > 0 ? (
                <div className="mt-12">
                  <SectionHeading
                    size="md"
                    eyebrow="Lifetime Bests"
                    title={
                      <span className="flex items-center gap-3">
                        <Trophy className="text-accent-500 h-6 w-6" aria-hidden="true" />
                        Your Records
                      </span>
                    }
                  />

                  <dl className="mt-8 grid gap-5 sm:grid-cols-3">
                    {records.map((record) => (
                      <Card key={record.label} tone="raised" className="p-6">
                        <dt className="text-fog text-[9px] font-semibold tracking-[0.16em] uppercase">
                          {record.label}
                        </dt>
                        <dd className="font-display text-chalk mt-2 text-3xl tabular-nums">
                          {record.value}
                        </dd>
                        <p className="text-fog mt-3 text-[10px] font-semibold tracking-[0.14em] uppercase">
                          {record.achieved}
                        </p>
                      </Card>
                    ))}
                  </dl>
                </div>
              ) : null}

              {/* Sessions */}
              <div className="mt-12">
                <SectionHeading size="md" eyebrow="History" title="Every Session." />

                <ul className="mt-8 grid gap-5">
                  {rows.map((row) => (
                    <li key={row.sessionId}>
                      <Card tone="raised" className="group relative p-6">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                          <h3 className="font-display text-chalk group-hover:text-accent-400 text-lg transition-colors duration-300">
                            <Link
                              href={`/workouts/history/${row.sessionId}`}
                              className="before:absolute before:inset-0 before:content-['']"
                            >
                              {row.workoutName}
                            </Link>
                          </h3>
                          <p className="text-fog text-[10px] font-semibold tracking-[0.16em] uppercase">
                            {row.completedLabel} · {row.sets.length}{" "}
                            {row.sets.length === 1 ? "set" : "sets"} · {row.volumeLabel}
                          </p>
                        </div>

                        {row.unknownWorkout ? (
                          <p className="text-fog mt-2 text-xs">
                            This workout is no longer in the catalogue.
                          </p>
                        ) : null}

                        <table className="mt-4 w-full text-sm">
                          <caption className="sr-only">
                            Sets logged on {row.completedLabel}
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
                            {row.sets.map((set) => (
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

                        {row.unmeasuredSets > 0 ? (
                          <p className="text-fog mt-4 text-xs leading-relaxed">
                            {row.unmeasuredSets}{" "}
                            {row.unmeasuredSets === 1 ? "set was" : "sets were"} logged
                            without a weight, so{" "}
                            {row.unmeasuredSets === 1 ? "it is" : "they are"} counted
                            above but not included in the volume.
                          </p>
                        ) : null}
                      </Card>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </Container>
      </section>
    </>
  );
}
