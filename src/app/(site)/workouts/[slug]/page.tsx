import { ArrowRight, Play } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { MetricCard } from "@/components/ui/MetricCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WorkoutExerciseRow } from "@/components/workouts/WorkoutExerciseRow";
import { getWorkout, totalSets, workoutMetaIcons, workouts } from "@/data/workouts";

export function generateStaticParams() {
  return workouts.map((workout) => ({ slug: workout.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/workouts/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const workout = getWorkout(slug);

  if (!workout) return { title: "Workout not found" };

  return { title: workout.title, description: workout.summary };
}

export default async function WorkoutDetailPage({
  params,
}: PageProps<"/workouts/[slug]">) {
  const { slug } = await params;
  const workout = getWorkout(slug);

  if (!workout) notFound();

  const specs = [
    {
      label: "Duration",
      value: `${workout.averageMinutes} min`,
      icon: workoutMetaIcons.duration,
    },
    {
      label: "Exercises",
      value: String(workout.exercises.length),
      icon: workoutMetaIcons.exercises,
    },
    { label: "Total Sets", value: String(totalSets(workout)), icon: workoutMetaIcons.level },
    {
      label: "Equipment",
      value: workout.equipmentLabel,
      icon: workoutMetaIcons.equipment,
    },
  ];

  return (
    <>
      <section className="border-chalk/8 relative overflow-hidden border-b pt-10 pb-14 lg:pt-14 lg:pb-20">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="bg-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_0%,#000_20%,transparent_78%)]" />
          <div className="bg-accent-500/15 absolute -top-52 left-1/3 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full blur-[140px]" />
        </div>

        <Container>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Workouts", href: "/workouts" },
              { label: workout.title },
            ]}
          />

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent">{workout.focus}</Badge>
                <Badge variant="outline">{workout.level}</Badge>
              </div>

              <h1 className="font-display text-chalk mt-6 text-5xl sm:text-6xl lg:text-7xl">
                {workout.title}
              </h1>

              <p className="text-mist mt-6 max-w-xl text-base leading-relaxed sm:text-lg">
                {workout.summary}
              </p>

              <div className="border-chalk/8 mt-8 border-t pt-6">
                <p className="text-fog text-[10px] font-semibold tracking-[0.2em] uppercase">
                  Target Muscles
                </p>
                <p className="text-chalk mt-2 text-sm font-semibold">
                  {workout.targetMuscles.join(" · ")}
                </p>
              </div>

              <div className="mt-9">
                <Button href={`/workouts/${workout.slug}/start`} size="lg">
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Start Workout
                </Button>
              </div>
            </div>

            <div className="relative lg:col-span-6">
              <div
                className="bg-accent-500/20 absolute -inset-6 -z-10 rounded-[2.5rem] blur-3xl"
                aria-hidden="true"
              />
              <ImagePlaceholder
                variant={workout.artwork}
                aspect="photo"
                alt={`${workout.title} artwork`}
                caption={`${workout.averageMinutes} min`}
                className="rounded-3xl shadow-lift"
              />
            </div>
          </div>

          <Card tone="glass" flush className="mt-12 rounded-3xl">
            <div className="divide-chalk/8 grid grid-cols-2 divide-y divide-x lg:grid-cols-4 lg:divide-y-0">
              {specs.map((spec) => (
                <div key={spec.label} className="p-6 sm:p-7">
                  <MetricCard
                    variant="bare"
                    size="sm"
                    value={spec.value}
                    label={spec.label}
                    icon={spec.icon}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container size="lg">
          <SectionHeading
            eyebrow="The Session"
            title="Exercise List."
            description="Every movement in order, with its prescribed sets and reps."
          />

          <ol className="mt-12 flex flex-col gap-3">
            {workout.exercises.map((exercise, index) => (
              <li key={exercise.id}>
                <WorkoutExerciseRow exercise={exercise} index={index} detailed />
              </li>
            ))}
          </ol>

          <Card
            tone="glass"
            className="mt-12 flex flex-col items-center gap-6 rounded-3xl py-12 text-center"
          >
            <h2 className="font-display text-chalk max-w-xl text-4xl sm:text-5xl">
              Ready When You Are.
            </h2>
            <p className="text-mist max-w-md text-sm leading-relaxed">
              {workout.exercises.length} exercises · {totalSets(workout)} sets ·{" "}
              {workout.averageMinutes} min average
            </p>
            <Button href={`/workouts/${workout.slug}/start`} size="lg">
              Start Workout
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                aria-hidden="true"
              />
            </Button>
          </Card>
        </Container>
      </section>
    </>
  );
}
