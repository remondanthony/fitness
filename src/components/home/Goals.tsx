import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { goals } from "@/lib/content";

export function Goals() {
  return (
    <section className="border-chalk/8 bg-ink-900 relative overflow-hidden border-y py-20 lg:py-28">
      <div
        className="bg-accent-500/8 pointer-events-none absolute top-1/2 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]"
        aria-hidden="true"
      />

      <Container className="relative">
        <SectionHeading
          align="center"
          eyebrow="Start Here"
          title="What's Your Goal?"
          description="Pick a direction and we will shape the training, nutrition and recovery around it."
        />

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <li key={goal.id}>
              <Card
                tone="raised"
                interactive
                className="group flex w-full items-center gap-4 p-5 text-left sm:p-6"
              >
                <span className="border-chalk/10 bg-chalk/5 text-mist group-hover:border-accent-500/40 group-hover:bg-accent-500/10 group-hover:text-accent-400 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300">
                  <goal.icon className="h-5 w-5" aria-hidden="true" />
                </span>

                <span className="text-chalk flex-1 text-base font-semibold tracking-tight">
                  <Link
                    href="/programs"
                    className="before:absolute before:inset-0 before:content-['']"
                  >
                    {goal.title}
                    <span className="sr-only"> — browse matching programs</span>
                  </Link>
                </span>

                <ArrowUpRight
                  className="text-fog group-hover:text-accent-400 h-5 w-5 shrink-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
