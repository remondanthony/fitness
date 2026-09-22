import { ArrowRight, CalendarDays, Dumbbell, Layers, Repeat } from "lucide-react";
import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BarChart } from "@/components/charts/BarChart";
import { LineChart } from "@/components/charts/LineChart";
import { PersonalRecordCard } from "@/components/progress/PersonalRecordCard";
import {
  summariseWindow,
  toRecordCards,
  toSessionSeries,
  toTrendSeries,
  toVolumeSeries,
} from "@/components/progress/view";
import { getExercise } from "@/data/exercises";
import { getPersonalization } from "@/lib/data/personalization";
import {
  getPersonalRecords,
  getStrengthTrend,
  getWeeklyProgress,
} from "@/lib/data/progress-analytics";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Progress",
  description:
    "Your completed sessions and training volume, week by week, from the workouts you have logged.",
};

/** Weeks of history shown. Matches the twelve-week framing of the page copy. */
const WEEKS = 12;

/**
 * Progress.
 *
 * Every number here is computed from the member's own completed sessions and
 * the sets inside them — totals, records and the strength trend alike. Where
 * the data cannot answer a question, such as bodyweight history, the page says
 * so rather than showing a plausible figure: a fabricated number on a progress
 * page is worse than a blank one, because it is the thing being trusted.
 *
 * Nothing here is estimated. The strength trend is the heaviest set actually
 * logged, named after the lift it follows, not a derived one-rep max.
 *
 * The route is protected by the proxy, and every read derives the member from
 * the session inside the data layer. No user id passes through this page.
 */
export default async function ProgressPage() {
  const [weekly, personalization, records, trend] = await Promise.all([
    getWeeklyProgress(WEEKS),
    getPersonalization(),
    getPersonalRecords(),
    getStrengthTrend(),
  ]);

  // exercise_logs stores a slug; the catalogue owns the name. An unrecognised
  // slug keeps its slug rather than being dropped — the record is still real,
  // and hiding it would lose a genuine best.
  const exerciseName = (slug: string) => getExercise(slug)?.name ?? slug;

  // Top exercises only. A card per record for every movement ever logged would
  // bury the lifts that matter under warm-ups.
  const recordCards = records.data
    .slice(0, 4)
    .flatMap((record) => toRecordCards(record, exerciseName(record.exerciseSlug)))
    .slice(0, 8);

  const trendExercise = trend.data.exerciseSlug;
  const trendSeries = toTrendSeries(trend.data.points);

  const summary = summariseWindow(weekly.data);

  // The member's own weekly goal, drawn as the target line. Omitted entirely
  // when they have not set one — an invented target would misread the chart.
  const weeklyTarget =
    personalization && !personalization.loadError
      ? (personalization.state.trainingDays ?? undefined)
      : undefined;

  const stats = [
    {
      id: "workouts",
      label: "Workouts",
      icon: Dumbbell,
      value: formatNumber(summary.sessions),
      caption: `Completed in the last ${WEEKS} weeks`,
    },
    {
      id: "volume",
      label: "Total Volume",
      icon: Layers,
      value: `${formatNumber(summary.volume)} kg`,
      caption: "Weight moved across every logged set",
    },
    {
      id: "average",
      label: "Weekly Average",
      icon: Repeat,
      value: summary.averagePerWeek.toFixed(1),
      caption: "Sessions per week, finished weeks only",
    },
    {
      id: "this-week",
      label: "This Week",
      icon: CalendarDays,
      value: formatNumber(summary.currentWeekSessions),
      caption: weeklyTarget ? `Your goal is ${weeklyTarget} a week` : "Sessions so far",
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Progress"
        title="Your Progress."
        description={`The last ${WEEKS} weeks of training, measured from the sessions you actually finished.`}
      />

      {weekly.error ? (
        <section className="py-12 lg:py-16">
          <Container>
            {/* A failed read is not an empty history. Saying "no workouts yet"
                here would tell a member with months of training that it had
                all gone. */}
            <ErrorState
              title="We couldn't load your progress."
              description="Your training history is safe — we just couldn't read it this time. Refreshing usually clears it."
            />
          </Container>
        </section>
      ) : !summary.hasHistory ? (
        <section className="py-12 lg:py-16">
          <Container>
            <EmptyState
              icon={Dumbbell}
              title="No progress to show yet"
              description={`Finish a workout and it appears here. Your sessions, volume and consistency build up over the following ${WEEKS} weeks.`}
              action={
                <Button href="/workouts" variant="secondary">
                  Browse Workouts
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              }
            />
          </Container>
        </section>
      ) : (
        <>
          {/* Headline metrics */}
          <section className="py-12 lg:py-16">
            <Container>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <Card key={stat.id} tone="raised" className="p-6">
                    <p className="text-fog flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase">
                      <stat.icon
                        className="text-accent-500 h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      {stat.label}
                    </p>

                    <p className="mt-4 flex items-baseline gap-3">
                      <span className="font-display text-chalk text-4xl sm:text-5xl">
                        {stat.value}
                      </span>
                    </p>

                    <p className="text-fog mt-4 text-xs leading-relaxed">
                      {stat.caption}
                    </p>
                  </Card>
                ))}
              </div>
            </Container>
          </section>

          {/* Charts */}
          <section className="border-chalk/8 bg-ink-900 border-y py-16 lg:py-20">
            <Container>
              <SectionHeading
                size="md"
                eyebrow="Trends"
                title={`${WEEKS} Weeks, Measured.`}
                description="Weeks you did not train are shown as zero rather than skipped — the gaps are part of the picture."
              />

              <div className="mt-12 grid gap-5 lg:grid-cols-12">
                {trendExercise && trendSeries.length >= 2 ? (
                  <Card tone="raised" className="lg:col-span-12">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <h3 className="font-display text-chalk text-2xl">
                        Heaviest Set · {exerciseName(trendExercise)}
                      </h3>
                      <p className="text-fog text-[10px] font-semibold tracking-[0.16em] uppercase">
                        Kilograms · Weeks you trained it
                      </p>
                    </div>
                    {/* The heaviest set actually logged — not an estimate, and
                        named so the line is never read as a general score. */}
                    <LineChart
                      id="strength"
                      className="mt-8"
                      data={trendSeries}
                      unit=" kg"
                      ticks={4}
                      formatValue={(value) => formatNumber(value)}
                    />
                  </Card>
                ) : trendExercise ? (
                  <Card tone="raised" className="lg:col-span-12 p-6">
                    <h3 className="font-display text-chalk text-2xl">
                      Heaviest Set · {exerciseName(trendExercise)}
                    </h3>
                    <p className="text-mist mt-3 text-sm leading-relaxed">
                      One week logged so far. A trend line appears once you have
                      trained this lift in a second week.
                    </p>
                  </Card>
                ) : null}

                <Card tone="raised" className="lg:col-span-12">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h3 className="font-display text-chalk text-2xl">Training Volume</h3>
                    <p className="text-fog text-[10px] font-semibold tracking-[0.16em] uppercase">
                      Kilograms · Weight × reps, per week
                    </p>
                  </div>
                  <LineChart
                    id="volume"
                    className="mt-8"
                    data={toVolumeSeries(weekly.data)}
                    unit=" kg"
                    ticks={4}
                    formatValue={(value) => formatNumber(value)}
                  />
                </Card>

                <Card tone="raised" className="lg:col-span-12">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h3 className="font-display text-chalk text-2xl">
                      Workout Consistency
                    </h3>
                    <p className="text-fog text-[10px] font-semibold tracking-[0.16em] uppercase">
                      Sessions per week · {summary.averagePerWeek.toFixed(1)} average
                    </p>
                  </div>
                  <BarChart
                    className="mt-8"
                    data={toSessionSeries(weekly.data)}
                    target={weeklyTarget}
                    unit=" sessions"
                  />
                </Card>
              </div>
            </Container>
          </section>
        </>
      )}

      {/* Personal records */}
      <section className="py-16 lg:py-20">
        <Container>
          <SectionHeading
            size="md"
            eyebrow="Lifetime Bests"
            title="Personal Records."
            description="Your best logged sets, taken from completed sessions only."
            action={
              <Button href="/exercises" variant="secondary" className="hidden md:inline-flex">
                Browse Exercises
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                  aria-hidden="true"
                />
              </Button>
            }
          />

          {records.error ? (
            <div className="mt-10">
              <ErrorState
                title="We couldn't load your records."
                description="Your logged sets are safe — we just couldn't read them this time."
              />
            </div>
          ) : recordCards.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                icon={Dumbbell}
                title="No records yet"
                description="Finish a workout and log a set. Your best weight and best reps for each exercise appear here."
                action={
                  <Button href="/workouts" variant="secondary">
                    Browse Workouts
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                }
              />
            </div>
          ) : (
            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {recordCards.map((record) => (
                <li key={record.id}>
                  <PersonalRecordCard record={record} />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

    </>
  );
}
