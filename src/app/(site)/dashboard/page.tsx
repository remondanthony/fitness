import { ArrowRight, Dumbbell, Flame, Sunrise } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { StatCard } from "@/components/ui/StatCard";
import { RecommendedShelf } from "@/components/dashboard/RecommendedShelf";
import { TodayWorkoutCard } from "@/components/dashboard/TodayWorkoutCard";
import { getAccountView } from "@/lib/data/account-view";
import { currentLogDate } from "@/lib/data/daily-date";
import { getPersonalization } from "@/lib/data/personalization";
import { getRecommendations } from "@/lib/data/recommendations";
import { getTrainingSummary } from "@/lib/data/progress-analytics";
import {
  equipmentOptions,
  goalOptions,
  labelFor,
  levelOptions,
} from "@/lib/personalization";
import { getWellnessLog, readingsFromLog } from "@/lib/data/wellness";
import { buildDailyMetrics } from "@/data/progress";
import { todaysWorkout } from "@/data/workouts";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Today's session, your daily metrics and where your training stands.",
};

export default async function DashboardPage() {
  // Protected route, so a member is always present.
  // getAccountView and getPersonalization read the same three cached queries,
  // so asking for both costs one round trip each, not two.
  const [view, wellness, personalization, recommendations, training] =
    await Promise.all([
      getAccountView(),
      getWellnessLog(currentLogDate()),
      getPersonalization(),
      getRecommendations(),
      getTrainingSummary(),
    ]);

  // A member who has not answered the personalization questions is sent to
  // onboarding. /onboarding never redirects back on load, so this cannot loop;
  // a failed read reports incomplete as false, so a database hiccup does not
  // eject a set-up member either.
  if (personalization && !personalization.loadError && !personalization.complete) {
    redirect("/onboarding");
  }

  // The wellness tiles read the same row /wellness writes, so the two screens
  // can never disagree about the same day.
  const wellnessTiles = buildDailyMetrics(readingsFromLog(wellness.data));

  const streak = training.data.streak;

  // The member's own weekly goal. Without one there is no denominator, so the
  // tile shows the count alone rather than inventing a target to divide by.
  const weeklyTarget =
    personalization && !personalization.loadError
      ? (personalization.state.trainingDays ?? null)
      : null;

  const done = training.data.thisWeekSessions;

  const metrics = [
    {
      id: "weekly-workouts",
      label: "Weekly Workouts",
      value: weeklyTarget ? `${done} / ${weeklyTarget}` : String(done),
      icon: Dumbbell,
      progress: weeklyTarget ? Math.min(1, done / weeklyTarget) : undefined,
      caption: training.error
        ? "We couldn't read your sessions"
        : weeklyTarget
          ? `Your goal is ${weeklyTarget} a week`
          : "Completed this week",
      ring: undefined as boolean | undefined,
    },
    ...wellnessTiles,
  ];

  // Only greet by name once the member actually has one saved; otherwise the
  // greeting stays generic rather than echoing an email local-part at them.
  const firstName = view && !view.usingFallbackName
    ? view.displayName.split(" ")[0]
    : null;

  return (
    <>
      {/* Greeting */}
      <section className="border-chalk/8 relative overflow-hidden border-b pt-10 pb-12 lg:pt-14 lg:pb-14">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="bg-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_0%,#000_20%,transparent_78%)]" />
          <div className="bg-accent-500/12 absolute -top-52 left-1/4 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full blur-[140px]" />
        </div>

        <Container>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-accent-400 flex items-center gap-3 text-[11px] font-semibold tracking-[0.32em] uppercase">
                <Sunrise className="h-4 w-4" aria-hidden="true" />
                Monday · Week 12
              </p>
              <h1 className="font-display text-chalk mt-5 text-5xl break-words sm:text-6xl lg:text-7xl">
                {firstName ? `Good Morning, ${firstName}.` : "Good Morning."}
              </h1>
              <p className="text-mist mt-4 text-base sm:text-lg">Ready to train?</p>

              {personalization?.complete ? (
                <ul className="mt-6 flex flex-wrap items-center gap-2">
                  {[
                    labelFor(goalOptions, personalization.state.goal),
                    labelFor(levelOptions, personalization.state.level),
                    labelFor(equipmentOptions, personalization.state.equipment),
                    personalization.state.trainingDays === null
                      ? null
                      : `${personalization.state.trainingDays}\u00d7 / week`,
                  ]
                    .filter((entry): entry is string => entry !== null)
                    .map((entry) => (
                      <li
                        key={entry}
                        className="border-chalk/12 bg-chalk/5 text-mist rounded-full border px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase"
                      >
                        {entry}
                      </li>
                    ))}
                  <li>
                    <Link
                      href="/onboarding"
                      className="text-fog hover:text-chalk focus-visible:outline-accent-500 rounded-full px-2 py-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      Edit
                    </Link>
                  </li>
                </ul>
              ) : null}
            </div>

            <Button href="/progress" variant="secondary">
              View Full Progress
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                aria-hidden="true"
              />
            </Button>
          </div>
        </Container>
      </section>

      {/* Today + streak */}
      <section className="pt-12 lg:pt-16">
        <Container>
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <TodayWorkoutCard workout={todaysWorkout} />
            </div>

            <Card
              tone="glass"
              className="flex flex-col justify-between gap-8 rounded-3xl p-7 lg:col-span-4"
            >
              <div>
                <p className="text-fog flex items-center gap-2 text-[10px] font-semibold tracking-[0.24em] uppercase">
                  <Flame className="text-accent-500 h-3.5 w-3.5" aria-hidden="true" />
                  Workout Streak
                </p>
                <p className="font-display text-chalk mt-6 text-6xl lg:text-7xl">
                  {streak.current} {streak.current === 1 ? "Day" : "Days"}
                </p>
                {/* A lapsed streak keeps its length but must not read as live,
                    so the line below says which it is rather than cheering. */}
                <p className="text-mist mt-3 text-sm leading-relaxed">
                  {training.error
                    ? "We couldn't read your training history."
                    : streak.current === 0
                      ? "Finish a workout to start one."
                      : streak.isActive
                        ? "Consecutive days trained — keep it alive."
                        : `Ended ${streak.daysSince} ${streak.daysSince === 1 ? "day" : "days"} ago.`}
                </p>
              </div>

              {/* Progress toward the personal best. Both numbers are the
                  member's own; with no history there is nothing to compare, so
                  the block is left out rather than drawn empty. */}
              {streak.longest > 0 ? (
                <div>
                  <div className="text-fog flex items-baseline justify-between text-[10px] font-semibold tracking-[0.16em] uppercase">
                    <span>Personal Best</span>
                    <span className="text-chalk">
                      {streak.longest} {streak.longest === 1 ? "Day" : "Days"}
                    </span>
                  </div>
                  <div
                    className="bg-chalk/8 mt-3 h-1.5 w-full overflow-hidden rounded-full"
                    role="progressbar"
                    aria-valuenow={streak.current}
                    aria-valuemin={0}
                    aria-valuemax={streak.longest}
                    aria-label="Streak progress toward personal best"
                  >
                    <span
                      className="from-accent-600 to-accent-400 bar-grow block h-full rounded-full bg-gradient-to-r"
                      style={{
                        width: `${Math.min(100, (streak.current / streak.longest) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-fog mt-3 text-xs">
                    {streak.current >= streak.longest
                      ? "This is your best run yet."
                      : `${streak.longest - streak.current} more ${
                          streak.longest - streak.current === 1 ? "day" : "days"
                        } to beat it.`}
                  </p>
                </div>
              ) : null}

              {/* Last seven days */}
              <div>
                <p className="text-fog text-[10px] font-semibold tracking-[0.2em] uppercase">
                  Last 7 Days
                </p>
                {/* Real UTC days, oldest first, ending today. An untrained
                    day has to be visible for a trained one to mean anything. */}
                <ul className="mt-4 flex items-center gap-2">
                  {streak.lastSevenDays.map((day) => (
                    <li key={day.date} className="flex-1">
                      <div
                        className={
                          day.trained
                            ? "border-accent-500/40 bg-accent-500/15 text-accent-400 flex h-11 items-center justify-center rounded-xl border text-[11px] font-semibold"
                            : "border-chalk/10 bg-chalk/[0.03] text-fog flex h-11 items-center justify-center rounded-xl border text-[11px] font-semibold"
                        }
                        title={`${day.date}${day.isToday ? " (today)" : ""} — ${
                          day.trained ? "trained" : "no session"
                        }`}
                      >
                        {day.label}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* Recommended */}
      {recommendations ? (
        <div className="mt-12 lg:mt-16">
          <RecommendedShelf recommendations={recommendations} />
        </div>
      ) : null}

      {/* Daily metrics */}
      <section className="py-12 lg:py-16">
        <Container>
          <h2 className="text-fog text-[11px] font-semibold tracking-[0.28em] uppercase">
            Today&apos;s Metrics
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {metrics.map((metric) => (
              <StatCard
                key={metric.id}
                label={metric.label}
                value={metric.value}
                icon={metric.icon}
                progress={metric.progress}
                caption={metric.caption}
                ring={metric.ring}
              />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
