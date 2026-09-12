import { ArrowRight, Check, Clock, Flame } from "lucide-react";
import Link from "next/link";
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
import { getProgram, programMetaIcons, programs } from "@/data/programs";
import { findExerciseByName } from "@/data/exercises";

export function generateStaticParams() {
  return programs.map((program) => ({ slug: program.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/programs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const program = getProgram(slug);

  if (!program) return { title: "Program not found" };

  return { title: program.title, description: program.summary };
}

export default async function ProgramDetailPage({
  params,
}: PageProps<"/programs/[slug]">) {
  const { slug } = await params;
  const program = getProgram(slug);

  if (!program) notFound();

  const specs = [
    { label: "Difficulty", value: program.level, icon: programMetaIcons.level },
    { label: "Duration", value: program.duration, icon: programMetaIcons.duration },
    { label: "Frequency", value: program.frequency, icon: programMetaIcons.frequency },
    { label: "Equipment", value: program.equipmentLabel, icon: programMetaIcons.equipment },
  ];

  return (
    <>
      {/* Hero */}
      <section className="border-chalk/8 relative overflow-hidden border-b pt-10 pb-16 lg:pt-14 lg:pb-20">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="bg-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_0%,#000_20%,transparent_78%)]" />
          <div className="bg-accent-500/15 absolute -top-52 left-1/3 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full blur-[140px]" />
        </div>

        <Container>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Programs", href: "/programs" },
              { label: program.title },
            ]}
          />

          <div className="mt-8 grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent">{program.level}</Badge>
                {program.goalLabels.map((goal) => (
                  <Badge key={goal}>{goal}</Badge>
                ))}
              </div>

              <h1 className="font-display text-chalk mt-6 text-5xl sm:text-6xl lg:text-7xl">
                {program.title}
              </h1>

              <p className="text-mist mt-6 max-w-xl text-base leading-relaxed sm:text-lg">
                {program.summary}
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button href="/workouts" size="lg">
                  Start Program
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                    aria-hidden="true"
                  />
                </Button>
                <Button href="/programs" size="lg" variant="secondary">
                  Browse Programs
                </Button>
              </div>

              <p className="text-fog mt-6 flex items-center gap-2 text-xs tracking-[0.16em] uppercase">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {program.sessionLength} per session
              </p>
            </div>

            <div className="relative lg:col-span-6">
              <div
                className="bg-accent-500/20 absolute -inset-6 -z-10 rounded-[2.5rem] blur-3xl"
                aria-hidden="true"
              />
              <ImagePlaceholder
                variant={program.artwork}
                aspect="wide"
                alt={`${program.title} programme artwork`}
                caption={program.duration}
                className="rounded-3xl shadow-lift"
              />
            </div>
          </div>

          {/* Spec panel */}
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

      {/* Overview + outcomes */}
      <section className="py-16 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <SectionHeading size="md" eyebrow="Overview" title="How This Block Works" />
              <div className="mt-8 flex flex-col gap-5">
                {program.overview.map((paragraph) => (
                  <p key={paragraph} className="text-mist text-base leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <Card tone="raised" className="h-full">
                <h2 className="font-display text-chalk text-3xl">What You&apos;ll Achieve</h2>
                <ul className="mt-7 flex flex-col gap-4">
                  {program.outcomes.map((outcome) => (
                    <li key={outcome} className="flex items-start gap-3">
                      <span className="border-accent-500/30 bg-accent-500/12 text-accent-400 mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="text-mist text-sm leading-relaxed">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Weekly schedule */}
      <section className="border-chalk/8 bg-ink-900 border-y py-16 lg:py-24">
        <Container>
          <SectionHeading
            eyebrow="Weekly Schedule"
            title="Week By Week."
            description={`${program.weeks.length} weeks of progressive overload, with deloads built in where they belong.`}
          />

          <ol className="mt-12 flex flex-col gap-4">
            {program.weeks.map((week) => {
              const sessions = week.sessions ?? program.split;
              return (
                <li key={week.week}>
                  <Card
                    tone="raised"
                    interactive
                    className="group flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-7 sm:p-6"
                  >
                    <div className="flex shrink-0 items-center gap-4 sm:w-44">
                      <span className="border-accent-500/25 bg-accent-500/10 text-accent-400 font-display group-hover:bg-accent-500 inline-flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl transition-colors duration-300 group-hover:text-white">
                        {week.week}
                      </span>
                      <div>
                        <p className="text-fog text-[10px] font-semibold tracking-[0.2em] uppercase">
                          Week {week.week}
                        </p>
                        <p className="text-chalk font-display mt-1 text-xl">{week.title}</p>
                      </div>
                    </div>

                    <p className="text-mist flex-1 text-sm leading-relaxed">{week.focus}</p>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      {sessions.map((session) => (
                        <span
                          key={session}
                          className="border-chalk/10 bg-chalk/[0.04] text-fog rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[0.1em] uppercase"
                        >
                          {session}
                        </span>
                      ))}
                      <Badge variant="outline" size="sm" className="gap-1.5">
                        <Flame className="text-accent-500 h-3 w-3" aria-hidden="true" />
                        {week.intensity}
                      </Badge>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      {/* Example workouts */}
      <section className="py-16 lg:py-24">
        <Container>
          <SectionHeading
            eyebrow="Inside The Program"
            title="Example Workouts."
            description="A sample of what a training week actually looks like. Every movement links to its full breakdown."
          />

          <ul className="mt-12 grid gap-6 lg:grid-cols-2">
            {program.workouts.map((workout) => (
              <li key={workout.day}>
                <Card tone="raised" className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-accent-400 text-[10px] font-semibold tracking-[0.24em] uppercase">
                        {workout.day}
                      </p>
                      <h3 className="font-display text-chalk mt-2 text-3xl">
                        {workout.title}
                      </h3>
                      <p className="text-fog mt-2 text-xs tracking-[0.12em] uppercase">
                        {workout.focus}
                      </p>
                    </div>
                    <Badge variant="outline" size="sm" className="gap-1.5">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {workout.duration}
                    </Badge>
                  </div>

                  <ul className="border-chalk/8 divide-chalk/8 mt-7 flex flex-col divide-y border-t">
                    {workout.exercises.map((exercise) => {
                      const entry = findExerciseByName(exercise.name);
                      return (
                        <li
                          key={exercise.name}
                          className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-4"
                        >
                          <div className="min-w-0">
                            {entry ? (
                              <Link
                                href={`/exercises/${entry.slug}`}
                                className="text-chalk hover:text-accent-400 text-sm font-semibold transition-colors duration-200"
                              >
                                {exercise.name}
                              </Link>
                            ) : (
                              <span className="text-chalk text-sm font-semibold">
                                {exercise.name}
                              </span>
                            )}
                            {exercise.note ? (
                              <p className="text-fog mt-1 text-xs leading-relaxed">
                                {exercise.note}
                              </p>
                            ) : null}
                          </div>
                          <span className="text-accent-400 shrink-0 text-xs font-semibold tracking-[0.1em] uppercase">
                            {exercise.scheme}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              </li>
            ))}
          </ul>

          <Card tone="glass" className="mt-12 flex flex-col items-center gap-6 rounded-3xl py-12 text-center">
            <h2 className="font-display text-chalk max-w-xl text-4xl sm:text-5xl">
              Ready To Start {program.title}?
            </h2>
            <p className="text-mist max-w-md text-sm leading-relaxed">
              {program.duration} · {program.frequency} · {program.equipmentLabel}
            </p>
            <Button href="/workouts" size="lg">
              Start Program
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
