import { ArrowRight, Waves } from "lucide-react";
import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatCard } from "@/components/ui/StatCard";
import { HabitList } from "@/components/wellness/HabitList";
import { RecoveryCard } from "@/components/wellness/RecoveryCard";
import { habits, recoverySessions, wellnessMetrics } from "@/data/wellness";

export const metadata: Metadata = {
  title: "Wellness",
  description:
    "Sleep, hydration, steps and recovery in one place, with today's habits and guided recovery sessions.",
};

export default function WellnessPage() {
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
          <h2 className="text-fog text-[11px] font-semibold tracking-[0.28em] uppercase">
            Today&apos;s Wellness
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {wellnessMetrics.map((metric) => (
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
              <HabitList
                habits={habits.map((habit) => ({
                  ...habit,
                  icon: <habit.icon className="h-4 w-4" />,
                }))}
              />
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
            {recoverySessions.map((session) => (
              <li key={session.slug}>
                <RecoveryCard session={session} />
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
