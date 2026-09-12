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
import {
  recentWorkouts,
  recommendedWorkouts,
  todaysWorkout,
  totalSets,
} from "@/data/workouts";

export const metadata: Metadata = {
  title: "Workouts",
  description:
    "Your session for today, what you have trained recently and what to do next.",
};

export default function WorkoutsPage() {
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
            description="What you have trained over the last week."
          />

          <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentWorkouts.map((workout, index) => (
              <li key={workout.slug}>
                <WorkoutCard workout={workout} variant="recent" index={index} />
              </li>
            ))}
          </ul>
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
