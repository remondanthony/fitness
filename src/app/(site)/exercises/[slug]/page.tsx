import { AlertTriangle, ArrowUpRight, Lightbulb, Target } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { exercises, getExercise, getExercises } from "@/data/exercises";

export function generateStaticParams() {
  return exercises.map((exercise) => ({ slug: exercise.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/exercises/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const exercise = getExercise(slug);

  if (!exercise) return { title: "Exercise not found" };

  return { title: exercise.name, description: exercise.summary };
}

export default async function ExerciseDetailPage({
  params,
}: PageProps<"/exercises/[slug]">) {
  const { slug } = await params;
  const exercise = getExercise(slug);

  if (!exercise) notFound();

  const alternatives = getExercises(exercise.alternatives);

  return (
    <>
      {/* Hero */}
      <section className="border-chalk/8 relative overflow-hidden border-b pt-10 pb-14 lg:pt-14 lg:pb-20">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="bg-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_0%,#000_20%,transparent_78%)]" />
          <div className="bg-accent-500/15 absolute -top-52 left-1/3 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full blur-[140px]" />
        </div>

        <Container>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Exercises", href: "/exercises" },
              { label: exercise.name },
            ]}
          />

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent">{exercise.primaryMuscle}</Badge>
                <Badge>{exercise.equipmentLabel}</Badge>
                <Badge variant="outline">{exercise.difficulty}</Badge>
              </div>

              <h1 className="font-display text-chalk mt-6 text-5xl sm:text-6xl">
                {exercise.name}
              </h1>

              <p className="text-mist mt-6 max-w-xl text-base leading-relaxed sm:text-lg">
                {exercise.summary}
              </p>

              <dl className="border-chalk/8 mt-9 grid gap-6 border-t pt-8 sm:grid-cols-2">
                <div>
                  <dt className="text-fog text-[10px] font-semibold tracking-[0.2em] uppercase">
                    Primary Muscles
                  </dt>
                  <dd className="text-chalk mt-2 text-sm leading-relaxed">
                    {exercise.musclesWorked.primary.join(" · ")}
                  </dd>
                </div>
                <div>
                  <dt className="text-fog text-[10px] font-semibold tracking-[0.2em] uppercase">
                    Secondary Muscles
                  </dt>
                  <dd className="text-mist mt-2 text-sm leading-relaxed">
                    {exercise.musclesWorked.secondary.join(" · ")}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="relative lg:col-span-6">
              <div
                className="bg-accent-500/20 absolute -inset-6 -z-10 rounded-[2.5rem] blur-3xl"
                aria-hidden="true"
              />
              <ImagePlaceholder
                variant={exercise.artwork}
                aspect="photo"
                alt={`${exercise.name} illustration`}
                caption={exercise.equipmentLabel}
                className="rounded-3xl shadow-lift"
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
            {/* Main column */}
            <div className="flex min-w-0 flex-col gap-14 lg:col-span-7">
              <div>
                <SectionHeading size="md" eyebrow="How To" title="Instructions" />
                <ol className="mt-8 flex flex-col gap-4">
                  {exercise.instructions.map((step, index) => (
                    <li key={step}>
                      <Card tone="raised" className="flex items-start gap-5 p-5">
                        <span className="border-accent-500/25 bg-accent-500/10 text-accent-400 font-display inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-lg">
                          {index + 1}
                        </span>
                        <p className="text-mist pt-1.5 text-sm leading-relaxed">{step}</p>
                      </Card>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <SectionHeading size="md" eyebrow="Watch Out" title="Common Mistakes" />
                <ul className="mt-8 flex flex-col gap-4">
                  {exercise.mistakes.map((mistake) => (
                    <li key={mistake.title}>
                      <Card tone="raised" className="flex items-start gap-5 p-5">
                        <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10 text-red-400">
                          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div>
                          <h3 className="text-chalk text-sm font-semibold">
                            {mistake.title}
                          </h3>
                          <p className="text-mist mt-2 text-sm leading-relaxed">
                            {mistake.detail}
                          </p>
                        </div>
                      </Card>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <SectionHeading size="md" eyebrow="Coaching" title="Tips" />
                <ul className="mt-8 flex flex-col gap-4">
                  {exercise.tips.map((tip) => (
                    <li key={tip} className="flex items-start gap-4">
                      <span className="border-accent-500/25 bg-accent-500/10 text-accent-400 mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border">
                        <Lightbulb className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <p className="text-mist text-sm leading-relaxed">{tip}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="flex min-w-0 flex-col gap-6 lg:col-span-5">
              <Card tone="raised" className="lg:sticky lg:top-24">
                <div className="flex items-center gap-3">
                  <Target className="text-accent-500 h-4 w-4" aria-hidden="true" />
                  <h2 className="text-chalk text-[11px] font-semibold tracking-[0.24em] uppercase">
                    Recommended Sets &amp; Reps
                  </h2>
                </div>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[18rem] border-collapse text-left">
                    <thead>
                      <tr className="border-chalk/8 border-b">
                        {["Goal", "Sets", "Reps", "Rest"].map((heading) => (
                          <th
                            key={heading}
                            scope="col"
                            className="text-fog pb-3 text-[10px] font-semibold tracking-[0.16em] uppercase"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-chalk/8 divide-y">
                      {exercise.prescription.map((row) => (
                        <tr key={row.goal}>
                          <th
                            scope="row"
                            className="text-chalk py-4 pr-3 text-sm font-semibold"
                          >
                            {row.goal}
                          </th>
                          <td className="text-mist py-4 pr-3 text-sm">{row.sets}</td>
                          <td className="text-accent-400 py-4 pr-3 text-sm font-semibold">
                            {row.reps}
                          </td>
                          <td className="text-mist py-4 text-sm">{row.rest}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </aside>
          </div>
        </Container>
      </section>

      {/* Alternatives */}
      {alternatives.length > 0 ? (
        <section className="border-chalk/8 bg-ink-900 border-t py-16 lg:py-24">
          <Container>
            <SectionHeading
              eyebrow="Swap It Out"
              title="Alternative Exercises."
              description="Same job, different equipment or difficulty. Any of these can replace the movement above."
            />

            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {alternatives.map((alternative) => (
                <li key={alternative.slug}>
                  <Card
                    interactive
                    tone="raised"
                    className="group flex h-full items-center gap-5 p-5"
                  >
                    <ImagePlaceholder
                      variant={alternative.artwork}
                      aspect="square"
                      alt=""
                      className="h-20 w-20 shrink-0 rounded-xl"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-chalk group-hover:text-accent-400 text-xl transition-colors duration-300">
                        <Link
                          href={`/exercises/${alternative.slug}`}
                          className="before:absolute before:inset-0 before:content-['']"
                        >
                          {alternative.name}
                        </Link>
                      </h3>
                      <p className="text-fog mt-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
                        {alternative.primaryMuscle} · {alternative.equipmentLabel}
                      </p>
                    </div>
                    <ArrowUpRight
                      className="text-fog group-hover:text-accent-400 h-4 w-4 shrink-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Card>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}
    </>
  );
}
