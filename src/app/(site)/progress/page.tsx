import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BarChart } from "@/components/charts/BarChart";
import { LineChart } from "@/components/charts/LineChart";
import { AchievementCard } from "@/components/progress/AchievementCard";
import { PersonalRecordCard } from "@/components/progress/PersonalRecordCard";
import {
  achievements,
  consistencySeries,
  personalRecords,
  progressStats,
  strengthSeries,
  weeklyTarget,
  weightSeries,
} from "@/data/progress";

export const metadata: Metadata = {
  title: "Progress",
  description:
    "Weight, strength and consistency over the last twelve weeks, plus your records and achievements.",
};

export default function ProgressPage() {
  const completedWeeks = consistencySeries.filter((week) => !week.current);
  const averagePerWeek =
    completedWeeks.reduce((sum, week) => sum + week.value, 0) / completedWeeks.length;

  return (
    <>
      <PageHero
        eyebrow="Progress"
        title="Your Progress."
        description="Twelve weeks of training, measured. Weight, strength and how consistently you turned up."
      />

      {/* Headline metrics */}
      <section className="py-12 lg:py-16">
        <Container>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {progressStats.map((stat) => (
              <Card key={stat.id} tone="raised" interactive className="group p-6">
                <p className="text-fog flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase">
                  <stat.icon className="text-accent-500 h-3.5 w-3.5" aria-hidden="true" />
                  {stat.label}
                </p>

                <p className="mt-4 flex items-baseline gap-3">
                  <span className="font-display text-chalk text-4xl sm:text-5xl">
                    {stat.value}
                  </span>
                  {stat.delta ? (
                    <span className="text-accent-400 inline-flex items-center gap-1 text-xs font-semibold">
                      {stat.delta.direction === "up" ? (
                        <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {stat.delta.value}
                    </span>
                  ) : null}
                </p>

                <p className="text-fog mt-4 text-xs leading-relaxed">{stat.caption}</p>
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
            title="Twelve Weeks, Measured."
            description="Every point is a weekly average, so a single heavy meal or bad night never moves the line on its own."
          />

          <div className="mt-12 grid gap-5 lg:grid-cols-12">
            <Card tone="raised" className="lg:col-span-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="font-display text-chalk text-2xl">Weight Progress</h3>
                <p className="text-fog text-[10px] font-semibold tracking-[0.16em] uppercase">
                  Kilograms · Weekly average
                </p>
              </div>
              <LineChart
                id="weight"
                className="mt-8"
                data={weightSeries}
                unit=" kg"
                ticks={4}
                formatValue={(value) => value.toFixed(1)}
              />
            </Card>

            <Card tone="raised" className="lg:col-span-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="font-display text-chalk text-2xl">Strength Progress</h3>
                <p className="text-fog text-[10px] font-semibold tracking-[0.16em] uppercase">
                  Estimated total 1RM
                </p>
              </div>
              <LineChart
                id="strength"
                className="mt-8"
                data={strengthSeries}
                unit=" kg"
                ticks={4}
                formatValue={(value) => String(Math.round(value))}
              />
            </Card>

            <Card tone="raised" className="lg:col-span-12">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="font-display text-chalk text-2xl">Workout Consistency</h3>
                <p className="text-fog text-[10px] font-semibold tracking-[0.16em] uppercase">
                  Sessions per week · {averagePerWeek.toFixed(1)} average
                </p>
              </div>
              <BarChart
                className="mt-8"
                data={consistencySeries}
                target={weeklyTarget}
                unit=" sessions"
              />
            </Card>
          </div>
        </Container>
      </section>

      {/* Achievements */}
      <section className="py-16 lg:py-20">
        <Container>
          <SectionHeading
            size="md"
            eyebrow="Milestones"
            title="Achievements."
            description="Earned by showing up, not by signing up."
          />

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {achievements.map((achievement) => (
              <li key={achievement.id}>
                <AchievementCard achievement={achievement} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Personal records */}
      <section className="border-chalk/8 border-t py-16 lg:py-20">
        <Container>
          <SectionHeading
            size="md"
            eyebrow="Lifetime Bests"
            title="Personal Records."
            description="Your heaviest clean rep on each of the big lifts."
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

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {personalRecords.map((record) => (
              <li key={record.id}>
                <PersonalRecordCard record={record} />
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
