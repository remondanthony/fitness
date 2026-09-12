import { ArrowRight, Check, Info } from "lucide-react";
import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { PricingCard } from "@/components/pricing/PricingCard";
import { plans, pricingNotes } from "@/data/pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Three plans: train on your own for free, get the full platform with Pro, or add a coach with Elite.",
};

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Membership"
        title="Choose Your Level."
        description="Start free and stay there if it suits you. Move up when you want programming, nutrition and recovery in one place."
      />

      {/* Plans */}
      <section className="py-16 lg:py-24">
        <Container>
          <h2 className="sr-only">Membership plans</h2>

          <ul className="grid gap-6 lg:grid-cols-3 lg:gap-5">
            {plans.map((plan) => (
              <li key={plan.id}>
                <PricingCard plan={plan} />
              </li>
            ))}
          </ul>

          <ul className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
            {pricingNotes.map((note) => (
              <li
                key={note}
                className="text-fog flex items-center gap-2.5 text-xs font-medium"
              >
                <Check className="text-accent-500 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {note}
              </li>
            ))}
          </ul>

          <p className="text-fog mx-auto mt-10 flex max-w-md items-start justify-center gap-2.5 text-center text-xs leading-relaxed">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>
              Checkout is not connected yet — the plan buttons above are placeholders.
            </span>
          </p>
        </Container>
      </section>

      {/* Coaching cross-link */}
      <section className="border-chalk/8 bg-ink-900 border-t py-16 lg:py-20">
        <Container>
          <Card
            tone="raised"
            className="flex flex-col items-center gap-6 rounded-3xl py-12 text-center"
          >
            <h2 className="font-display text-chalk max-w-2xl text-4xl sm:text-5xl">
              Not Sure Which Level?
            </h2>
            <p className="text-mist max-w-lg text-sm leading-relaxed">
              Pro covers everything most people need. Elite adds a coach who reads your
              logs and adjusts the plan — see who you would be working with first.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button href="/coaching" size="lg" variant="secondary">
                Meet The Coaches
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                  aria-hidden="true"
                />
              </Button>
              <Button href="/programs" size="lg" variant="secondary">
                Browse Programs
              </Button>
            </div>
          </Card>
        </Container>
      </section>
    </>
  );
}
