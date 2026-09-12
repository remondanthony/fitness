import { ArrowRight, MessageSquare, ShieldCheck, Users } from "lucide-react";
import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CoachCard } from "@/components/coaching/CoachCard";
import { coaches } from "@/data/coaching";

export const metadata: Metadata = {
  title: "Coaching",
  description:
    "Get personalized guidance from experienced coaches who understand your goals.",
};

const howItWorks = [
  {
    icon: Users,
    title: "Pick a coach",
    body: "Read how each of them works and choose the one whose approach fits your goal.",
  },
  {
    icon: MessageSquare,
    title: "Book a consultation",
    body: "A 30-minute call to go through your training history, schedule and equipment.",
  },
  {
    icon: ShieldCheck,
    title: "Train with a plan",
    body: "You get programming built for your week, reviewed and adjusted as you log sessions.",
  },
];

export default function CoachingPage() {
  return (
    <>
      <PageHero
        eyebrow="Coaching"
        title="Train With Experts."
        description="Get personalized guidance from experienced coaches who understand your goals."
      />

      {/* Coaches */}
      <section className="py-14 lg:py-20">
        <Container>
          <h2 className="text-fog text-[11px] font-semibold tracking-[0.28em] uppercase">
            Our Coaches
          </h2>

          <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coaches.map((coach) => (
              <li key={coach.slug}>
                <CoachCard coach={coach} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* How it works */}
      <section className="border-chalk/8 bg-ink-900 border-y py-16 lg:py-20">
        <Container>
          <SectionHeading
            size="md"
            eyebrow="How It Works"
            title="Three Steps."
            description="No onboarding maze. A call, a plan, and someone checking your logs every week."
          />

          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {howItWorks.map((step, index) => (
              <li key={step.title}>
                <Card tone="raised" className="group flex h-full flex-col p-7">
                  <span
                    className="font-display text-chalk/8 group-hover:text-accent-500/20 absolute top-4 right-6 text-6xl transition-colors duration-300"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="border-accent-500/25 bg-accent-500/10 text-accent-400 inline-flex h-12 w-12 items-center justify-center rounded-2xl border">
                    <step.icon className="h-5 w-5" aria-hidden="true" />
                  </span>

                  <h3 className="font-display text-chalk mt-6 text-2xl">{step.title}</h3>
                  <p className="text-mist mt-3 text-sm leading-relaxed">{step.body}</p>
                </Card>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Closing */}
      <section className="py-16 lg:py-24">
        <Container>
          <Card
            tone="glass"
            className="flex flex-col items-center gap-6 rounded-3xl py-14 text-center"
          >
            <h2 className="font-display text-chalk max-w-2xl text-4xl sm:text-5xl">
              Coaching Is Included With Elite.
            </h2>
            <p className="text-mist max-w-md text-sm leading-relaxed">
              Direct coach access and a monthly consultation come with the Elite plan.
            </p>
            <Button href="/pricing" size="lg">
              See Pricing
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
