import { Clock, MapPin, Star, Users } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { MetricCard } from "@/components/ui/MetricCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StarRating } from "@/components/ui/StarRating";
import { ConsultationButton } from "@/components/coaching/ConsultationButton";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { TestimonialCard } from "@/components/coaching/TestimonialCard";
import { coaches, getCoach } from "@/data/coaching";
import { getProgram } from "@/data/programs";

export function generateStaticParams() {
  return coaches.map((coach) => ({ slug: coach.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/coaching/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const coach = getCoach(slug);

  if (!coach) return { title: "Coach not found" };

  return { title: coach.name, description: coach.tagline };
}

export default async function CoachDetailPage({
  params,
}: PageProps<"/coaching/[slug]">) {
  const { slug } = await params;
  const coach = getCoach(slug);

  if (!coach) notFound();

  const programs = coach.programSlugs
    .map((programSlug) => getProgram(programSlug))
    .filter((program) => program !== undefined);

  const stats = [
    {
      label: "Experience",
      value: `${coach.yearsExperience} yrs`,
      icon: Clock,
    },
    { label: "Rating", value: coach.rating.toFixed(1), icon: Star },
    { label: "Clients", value: `${coach.clients}+`, icon: Users },
    { label: "Based", value: coach.location, icon: MapPin },
  ];

  return (
    <>
      {/* Profile */}
      <section className="border-chalk/8 relative overflow-hidden border-b pt-10 pb-14 lg:pt-14 lg:pb-20">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="bg-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_0%,#000_20%,transparent_78%)]" />
          <div className="bg-accent-500/15 absolute -top-52 left-1/3 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full blur-[140px]" />
        </div>

        <Container>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Coaching", href: "/coaching" },
              { label: coach.name },
            ]}
          />

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent">{coach.specialty}</Badge>
                <Badge variant="outline">{coach.availability}</Badge>
              </div>

              <h1 className="font-display text-chalk mt-6 text-5xl sm:text-6xl lg:text-7xl">
                {coach.name}
              </h1>

              <div className="mt-5 flex items-center gap-3">
                <StarRating value={coach.rating} size="md" />
                <span className="text-chalk text-sm font-semibold">
                  {coach.rating.toFixed(1)}
                </span>
                <span className="text-fog text-sm">
                  from {coach.clients}+ clients
                </span>
              </div>

              <p className="text-mist mt-6 max-w-xl text-base leading-relaxed sm:text-lg">
                {coach.tagline}
              </p>

              <div className="mt-9">
                <ConsultationButton coachName={coach.name} />
              </div>
            </div>

            <div className="relative lg:col-span-6">
              <div
                className="bg-accent-500/20 absolute -inset-6 -z-10 rounded-[2.5rem] blur-3xl"
                aria-hidden="true"
              />
              <ImagePlaceholder
                variant={coach.artwork}
                aspect="photo"
                alt={`Portrait illustration of ${coach.name}`}
                caption={`${coach.yearsExperience} years coaching`}
                className="rounded-3xl shadow-lift"
              />
            </div>
          </div>

          <Card tone="glass" flush className="mt-12 rounded-3xl">
            <div className="divide-chalk/8 grid grid-cols-2 divide-x divide-y lg:grid-cols-4 lg:divide-y-0">
              {stats.map((stat) => (
                <div key={stat.label} className="p-6 sm:p-7">
                  <MetricCard
                    variant="bare"
                    size="sm"
                    value={stat.value}
                    label={stat.label}
                    icon={stat.icon}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Container>
      </section>

      {/* Background + specialties */}
      <section className="py-16 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <SectionHeading size="md" eyebrow="Background" title="About" />
              <div className="mt-8 flex flex-col gap-5">
                {coach.bio.map((paragraph) => (
                  <p key={paragraph} className="text-mist text-base leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              <ul className="border-chalk/8 mt-10 flex flex-wrap gap-2 border-t pt-8">
                {coach.credentials.map((credential) => (
                  <li
                    key={credential}
                    className="border-chalk/10 bg-chalk/[0.04] text-mist rounded-full border px-3.5 py-1.5 text-xs font-medium"
                  >
                    {credential}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-5">
              <Card tone="raised" className="h-full">
                <h2 className="font-display text-chalk text-3xl">Specialties</h2>
                <ul className="mt-7 flex flex-col gap-4">
                  {coach.specialties.map((specialty) => (
                    <li key={specialty.label} className="flex items-start gap-3.5">
                      <span className="border-accent-500/25 bg-accent-500/10 text-accent-400 mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border">
                        <specialty.icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="text-mist text-sm leading-relaxed">
                        {specialty.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Philosophy */}
      <section className="border-chalk/8 bg-ink-900 border-y py-16 lg:py-24">
        <Container>
          <SectionHeading
            eyebrow="Approach"
            title="Training Philosophy."
            description="Three things that shape every plan this coach writes."
          />

          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {coach.philosophy.map((principle, index) => (
              <li key={principle.title}>
                <Card tone="raised" className="group flex h-full flex-col p-7">
                  <span
                    className="font-display text-accent-500/30 group-hover:text-accent-500/60 text-5xl transition-colors duration-300"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-chalk mt-5 text-2xl leading-tight">
                    {principle.title}
                  </h3>
                  <p className="text-mist mt-4 text-sm leading-relaxed">
                    {principle.body}
                  </p>
                </Card>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Programs */}
      {programs.length > 0 ? (
        <section className="py-16 lg:py-24">
          <Container>
            <SectionHeading
              size="md"
              eyebrow="Programming"
              title="Programs By This Coach."
              description="Written for the platform and used with clients every week."
            />

            <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {programs.map((program, index) => (
                <li key={program.slug}>
                  <ProgramCard program={program} index={index} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {/* Testimonials */}
      <section className="border-chalk/8 border-t py-16 lg:py-24">
        <Container>
          <SectionHeading
            size="md"
            eyebrow="Members"
            title="What Clients Say."
          />

          <ul className="mt-12 grid gap-5 md:grid-cols-2">
            {coach.testimonials.map((testimonial) => (
              <li key={testimonial.id}>
                <TestimonialCard testimonial={testimonial} />
              </li>
            ))}
          </ul>

          <Card
            tone="glass"
            className="mt-12 flex flex-col items-center gap-6 rounded-3xl py-12 text-center"
          >
            <h2 className="font-display text-chalk max-w-xl text-4xl sm:text-5xl">
              Work With {coach.name}.
            </h2>
            <p className="text-mist max-w-md text-sm leading-relaxed">
              {coach.availability}. Start with a 30-minute consultation to see whether the
              fit is right.
            </p>
            <ConsultationButton coachName={coach.name} />
          </Card>
        </Container>
      </section>
    </>
  );
}
