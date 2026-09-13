import { AlertCircle, ArrowRight, Waves } from "lucide-react";
import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatCard } from "@/components/ui/StatCard";
import { HabitList } from "@/components/wellness/HabitList";
import { RecoveryCard } from "@/components/wellness/RecoveryCard";
import { WellnessLogForm } from "@/components/wellness/WellnessLogForm";
import { getSessionUser } from "@/lib/auth/session";
import { currentLogDate, formatLogDate } from "@/lib/data/daily-date";
import { getHabitsForDate } from "@/lib/data/habits";
import { getWellnessLog, readingsFromLog } from "@/lib/data/wellness";
import {
  buildWellnessMetrics,
  emptyReadings,
  habitIconFor,
  recoverySessions,
} from "@/data/wellness";

export const metadata: Metadata = {
  title: "Wellness",
  description:
    "Sleep, hydration, steps and recovery in one place, with today's habits and guided recovery sessions.",
};

export default async function WellnessPage() {
  const logDate = currentLogDate();
  const user = await getSessionUser();

  // Signed-out visitors see the page as a preview: real structure, no figures
  // and no way to log, rather than someone else's numbers.
  const [log, habitList] = user
    ? await Promise.all([getWellnessLog(logDate), getHabitsForDate(logDate)])
    : [null, null];

  const readings = readingsFromLog(log?.data ?? null);
  const metrics = buildWellnessMetrics(user ? readings : emptyReadings);
  const loadFailed = Boolean(log?.error || habitList?.error);

  return (
    <>
      <PageHero
        eyebrow="Wellness"
        title={
          <>
            Perform Better.
            <br />
            Recover Better.
          </>
        }
        description="The work between sessions. Track the handful of daily inputs that decide how the next one goes."
      />

      {/* Daily metrics */}
      <section className="py-14 lg:py-20">
        <Container>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-fog text-[11px] font-semibold tracking-[0.28em] uppercase">
              Today&apos;s Wellness
            </h2>
            <p className="text-fog text-[11px] font-semibold tracking-[0.16em] uppercase">
              {formatLogDate(logDate)}
            </p>
          </div>

          {loadFailed ? (
            <p
              role="alert"
              className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-300"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              We couldn&apos;t load today&apos;s log. Refresh to try again.
            </p>
          ) : null}

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

          <div className="mt-6">
            {user ? (
              <WellnessLogForm readings={readings} />
            ) : (
              <Card tone="raised" className="flex flex-wrap items-center justify-between gap-5 p-6 sm:p-7">
                <div className="min-w-0">
                  <h3 className="text-chalk text-[11px] font-semibold tracking-[0.24em] uppercase">
                    Log Today
                  </h3>
                  <p className="text-fog mt-2 text-xs leading-relaxed">
                    Sign in to record your sleep, water, steps and recovery — they&apos;re saved to your account.
                  </p>
                </div>
                <Button href="/login?next=/wellness" variant="secondary" className="shrink-0">
                  Sign In
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                    aria-hidden="true"
                  />
                </Button>
              </Card>
            )}
          </div>
        </Container>
      </section>

      {/* Habits */}
      <section className="border-chalk/8 bg-ink-900 border-y py-16 lg:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <SectionHeading
                size="md"
                eyebrow="Consistency"
                title="Small Things, Daily."
                description="Four inputs you control. Tick them off as you go — the streak looks after itself."
              />
              <Button href="/progress" variant="secondary" className="mt-8">
                See Your Streak
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                  aria-hidden="true"
                />
              </Button>
            </div>

            <div className="lg:col-span-7">
              {user && habitList ? (
                <HabitList
                  habits={habitList.data.map((habit) => {
                    const Icon = habitIconFor(habit.name);

                    return {
                      id: habit.id,
                      title: habit.name,
                      detail: habit.description ?? "",
                      completed: habit.completed,
                      icon: <Icon className="h-4 w-4" />,
                    };
                  })}
                />
              ) : (
                <Card tone="raised" className="p-6 sm:p-8">
                  <h2 className="text-chalk text-[11px] font-semibold tracking-[0.28em] uppercase">
                    Today&apos;s Habits
                  </h2>
                  <p className="text-fog mt-3 text-sm leading-relaxed">
                    Sign in to build your habit list and tick it off each day.
                  </p>
                  <Button href="/login?next=/wellness" variant="secondary" className="mt-6">
                    Sign In
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                      aria-hidden="true"
                    />
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Recovery */}
      <section className="py-16 lg:py-24">
        <Container>
          <SectionHeading
            size="md"
            eyebrow="Recovery"
            title={
              <span className="flex items-center gap-4">
                <Waves className="text-accent-500 h-7 w-7" aria-hidden="true" />
                Recovery Sessions
              </span>
            }
            description="Short guided sessions for the time between training days."
            action={
              <Button href="/recovery" variant="secondary" className="hidden md:inline-flex">
                All Recovery Sessions
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                  aria-hidden="true"
                />
              </Button>
            }
          />

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {recoverySessions.map((session, index) => (
              <li key={session.slug}>
                <RecoveryCard session={session} index={index} />
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
