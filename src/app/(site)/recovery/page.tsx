import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { RecoveryCard } from "@/components/wellness/RecoveryCard";
import { recoverySessions } from "@/data/wellness";

export const metadata: Metadata = {
  title: "Recovery",
  description:
    "Short guided mobility, stretching and wind-down sessions for the days between training.",
};

export default function RecoveryPage() {
  const totalMinutes = recoverySessions.reduce(
    (sum, session) => sum + session.minutes,
    0,
  );

  return (
    <>
      <PageHero
        eyebrow="Recovery"
        title="Recover On Purpose."
        description="Training is the stimulus. This is the part that lets you repeat it — short sessions you can do at home, no equipment needed."
      />

      <section className="py-14 lg:py-20">
        <Container>
          <h2 className="text-fog text-[11px] font-semibold tracking-[0.28em] uppercase">
            Guided Sessions
          </h2>

          <Card tone="glass" flush className="mt-6 rounded-3xl">
            <dl className="divide-chalk/8 grid grid-cols-3 divide-x">
              {[
                { label: "Sessions", value: String(recoverySessions.length) },
                { label: "Total Time", value: `${totalMinutes} min` },
                { label: "Equipment", value: "None" },
              ].map((stat) => (
                <div key={stat.label} className="p-6 text-center sm:p-7">
                  <dd className="font-display text-chalk text-2xl sm:text-3xl">
                    {stat.value}
                  </dd>
                  <dt className="text-fog mt-2 text-[10px] font-semibold tracking-[0.18em] uppercase">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
          </Card>

          <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {recoverySessions.map((session, index) => (
              <li key={session.slug}>
                <RecoveryCard session={session} index={index} />
              </li>
            ))}
          </ul>

          <Card
            tone="raised"
            className="mt-12 flex flex-col items-center gap-6 rounded-3xl py-12 text-center"
          >
            <h2 className="font-display text-chalk max-w-xl text-3xl sm:text-4xl">
              Recovery Is Part Of The Plan.
            </h2>
            <p className="text-mist max-w-md text-sm leading-relaxed">
              Pair a session with your daily habits and keep an eye on how your sleep and
              training load are trending.
            </p>
            <Button href="/wellness" size="lg" variant="secondary">
              Back To Wellness
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
