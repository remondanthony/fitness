import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { principles } from "@/data/company";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why STRONGER exists: programming, nutrition and recovery in one place, without the noise.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Built For People Who Keep Showing Up."
        description="STRONGER puts programming, nutrition and recovery in one place, so the plan you follow on a good week is the same one you follow on a bad one."
      />

      <section className="overflow-hidden py-14 lg:py-20">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6">
              <SectionHeading size="md" eyebrow="The Idea" title="One Plan, Not Five Apps." />
              <div className="mt-8 flex flex-col gap-5">
                <p className="text-mist text-base leading-relaxed">
                  Most people end up with a spreadsheet for lifting, an app for food, a
                  watch for sleep and no connection between any of them. The training
                  suffers for it, usually somewhere around week six.
                </p>
                <p className="text-mist text-base leading-relaxed">
                  We built STRONGER so the program knows what you ate, the nutrition
                  targets know what you lifted, and the recovery work knows what is coming
                  tomorrow. Everything in one place, adjusted around the week you actually
                  have.
                </p>
              </div>
            </div>

            <div className="relative lg:col-span-6">
              <div
                className="bg-accent-500/20 absolute -inset-6 -z-10 rounded-[2.5rem] blur-3xl"
                aria-hidden="true"
              />
              <ImagePlaceholder
                variant="hero"
                aspect="photo"
                alt="Illustration of an athlete training in a dark gym"
                className="rounded-3xl shadow-lift"
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-chalk/8 bg-ink-900 border-y py-16 lg:py-20">
        <Container>
          <SectionHeading
            size="md"
            eyebrow="Principles"
            title="What We Hold To."
            description="Three things that decide what goes into the product and what stays out."
          />

          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {principles.map((principle) => (
              <li key={principle.title}>
                <Card tone="raised" className="flex h-full flex-col p-7">
                  <span className="border-accent-500/25 bg-accent-500/10 text-accent-400 inline-flex h-12 w-12 items-center justify-center rounded-2xl border">
                    <principle.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-chalk mt-6 text-2xl leading-tight">
                    {principle.title}
                  </h3>
                  <p className="text-mist mt-4 text-sm leading-relaxed">{principle.body}</p>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-16 lg:py-20">
        <Container>
          <Card
            tone="glass"
            className="flex flex-col items-center gap-6 rounded-3xl py-12 text-center"
          >
            <h2 className="font-display text-chalk max-w-xl text-4xl sm:text-5xl">
              Start With A Program.
            </h2>
            <p className="text-mist max-w-md text-sm leading-relaxed">
              Six blocks covering everything from your first six weeks to advanced
              athletic work.
            </p>
            <Button href="/programs" size="lg">
              Browse Programs
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
