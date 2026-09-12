import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { MetricCard } from "@/components/ui/MetricCard";
import { heroMetrics } from "@/lib/content";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,#000_25%,transparent_80%)] opacity-70" />
        <div className="bg-accent-500/18 animate-breathe absolute -top-40 -left-32 h-[34rem] w-[34rem] rounded-full blur-[140px]" />
        <div className="bg-accent-700/12 absolute -top-20 right-0 h-[28rem] w-[28rem] rounded-full blur-[150px]" />
        <div className="from-ink-950 absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t to-transparent" />
      </div>

      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6 xl:col-span-6">
            <Badge
              variant="accent"
              className="animate-rise gap-2"
              style={{ animationDelay: "40ms" }}
            >
              <span className="bg-accent-500 h-1.5 w-1.5 rounded-full" aria-hidden="true" />
              Fitness &amp; Wellness
            </Badge>

            {/* Each line enters on its own beat. */}
            <h1 className="font-display text-chalk mt-7 text-[3.25rem] leading-[0.92] sm:text-7xl lg:text-[5.25rem] xl:text-[5.75rem]">
              <span
                className="animate-rise block"
                style={{ animationDelay: "120ms" }}
              >
                Build Your
              </span>
              <span
                className="animate-rise block"
                style={{ animationDelay: "220ms" }}
              >
                Stronger Self<span className="text-accent-500">.</span>
              </span>
            </h1>

            <p
              className="text-mist animate-rise mt-7 max-w-xl text-base leading-relaxed sm:text-lg"
              style={{ animationDelay: "340ms" }}
            >
              Personalized training, nutrition and wellness programs designed around
              your goals.
            </p>

            <div
              className="animate-rise mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
              style={{ animationDelay: "440ms" }}
            >
              <Button href="/register" size="lg">
                Start Your Journey
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                  aria-hidden="true"
                />
              </Button>
              <Button href="/programs" size="lg" variant="secondary">
                Explore Programs
              </Button>
            </div>

            <p
              className="text-fog animate-rise mt-8 text-xs tracking-[0.16em] uppercase"
              style={{ animationDelay: "540ms" }}
            >
              No equipment required to start · Cancel anytime
            </p>
          </div>

          <div className="relative lg:col-span-6">
            <div
              className="bg-accent-500/20 absolute -inset-6 -z-10 rounded-[2.5rem] blur-3xl"
              aria-hidden="true"
            />
            <ImagePlaceholder
              variant="hero"
              aspect="hero"
              alt="Athlete pressing a barbell overhead in a dark, cinematic gym"
              caption="The Strength Floor"
              className="animate-scale-in rounded-3xl shadow-lift"
            />
          </div>
        </div>

        {/* Floating metrics panel */}
        <Card
          tone="glass"
          flush
          className="animate-rise relative z-10 mt-10 rounded-3xl lg:-mt-14"
          style={{ animationDelay: "620ms" }}
        >
          <div className="divide-chalk/8 grid grid-cols-2 divide-y divide-x sm:divide-y-0 lg:grid-cols-4">
            {heroMetrics.map((metric) => (
              <div key={metric.label} className="p-6 sm:p-8">
                <MetricCard
                  variant="bare"
                  value={metric.value}
                  label={metric.label}
                  icon={metric.icon}
                />
              </div>
            ))}
          </div>
        </Card>
      </Container>
    </section>
  );
}
