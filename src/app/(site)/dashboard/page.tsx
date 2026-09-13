import { ArrowRight, Flame, Sunrise } from "lucide-react";
import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { StatCard } from "@/components/ui/StatCard";
import { TodayWorkoutCard } from "@/components/dashboard/TodayWorkoutCard";
import { getAccountView } from "@/lib/data/account-view";
import { currentLogDate } from "@/lib/data/daily-date";
import { getWellnessLog, readingsFromLog } from "@/lib/data/wellness";
import { buildDailyMetrics } from "@/data/progress";
import { todaysWorkout } from "@/data/workouts";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Today's session, your daily metrics and where your training stands.",
};

export default async function DashboardPage() {
  // Protected route, so a member is always present.
  const [view, wellness] = await Promise.all([
    getAccountView(),
    getWellnessLog(currentLogDate()),
  ]);

  // The wellness tiles read the same row /wellness writes, so the two screens
  // can never disagree about the same day.
  const [streak, ...metrics] = buildDailyMetrics(readingsFromLog(wellness.data));

  // Only greet by name once the member actually has one saved; otherwise the
  // greeting stays generic rather than echoing an email local-part at them.
  const firstName = view && !view.usingFallbackName
    ? view.displayName.split(" ")[0]
    : null;

  return (
    <>
      {/* Greeting */}
      <section className="border-chalk/8 relative overflow-hidden border-b pt-10 pb-12 lg:pt-14 lg:pb-14">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="bg-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_0%,#000_20%,transparent_78%)]" />
          <div className="bg-accent-500/12 absolute -top-52 left-1/4 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full blur-[140px]" />
        </div>

        <Container>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-accent-400 flex items-center gap-3 text-[11px] font-semibold tracking-[0.32em] uppercase">
                <Sunrise className="h-4 w-4" aria-hidden="true" />
                Monday · Week 12
              </p>
              <h1 className="font-display text-chalk mt-5 text-5xl break-words sm:text-6xl lg:text-7xl">
                {firstName ? `Good Morning, ${firstName}.` : "Good Morning."}
              </h1>
              <p className="text-mist mt-4 text-base sm:text-lg">Ready to train?</p>
            </div>

            <Button href="/progress" variant="secondary">
              View Full Progress
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                aria-hidden="true"
              />
            </Button>
          </div>
        </Container>
      </section>

      {/* Today + streak */}
      <section className="pt-12 lg:pt-16">
        <Container>
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <TodayWorkoutCard workout={todaysWorkout} />
            </div>

            <Card
              tone="glass"
              className="flex flex-col justify-between gap-8 rounded-3xl p-7 lg:col-span-4"
            >
              <div>
                <p className="text-fog flex items-center gap-2 text-[10px] font-semibold tracking-[0.24em] uppercase">
                  <Flame className="text-accent-500 h-3.5 w-3.5" aria-hidden="true" />
                  {streak.label}
                </p>
                <p className="font-display text-chalk mt-6 text-6xl lg:text-7xl">
                  {streak.value}
                </p>
                <p className="text-mist mt-3 text-sm leading-relaxed">{streak.caption}</p>
              </div>

              {/* Progress toward the personal best */}
              <div>
                <div className="text-fog flex items-baseline justify-between text-[10px] font-semibold tracking-[0.16em] uppercase">
                  <span>Personal Best</span>
                  <span className="text-chalk">14 Days</span>
                </div>
                <div
                  className="bg-chalk/8 mt-3 h-1.5 w-full overflow-hidden rounded-full"
                  role="progressbar"
                  aria-valuenow={12}
                  aria-valuemin={0}
                  aria-valuemax={14}
                  aria-label="Streak progress toward personal best"
                >
                  <span
                    className="from-accent-600 to-accent-400 bar-grow block h-full rounded-full bg-gradient-to-r"
                    style={{ width: `${(12 / 14) * 100}%` }}
                  />
                </div>
                <p className="text-fog mt-3 text-xs">Two more days to beat it.</p>
              </div>

              {/* Last seven days */}
              <div>
                <p className="text-fog text-[10px] font-semibold tracking-[0.2em] uppercase">
                  Last 7 Days
                </p>
                <ul className="mt-4 flex items-center gap-2">
                  {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => {
                    const trained = index !== 5;
                    return (
                      <li key={`${day}-${index}`} className="flex-1">
                        <div
                          className={
                            trained
                              ? "border-accent-500/40 bg-accent-500/15 text-accent-400 flex h-11 items-center justify-center rounded-xl border text-[11px] font-semibold"
                              : "border-chalk/10 bg-chalk/[0.03] text-fog flex h-11 items-center justify-center rounded-xl border text-[11px] font-semibold"
                          }
                          title={trained ? "Trained" : "Rest day"}
                        >
                          {day}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* Daily metrics */}
      <section className="py-12 lg:py-16">
        <Container>
          <h2 className="text-fog text-[11px] font-semibold tracking-[0.28em] uppercase">
            Today&apos;s Metrics
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {metrics.map((metric) => (
              <StatCard
                key={metric.id}
                label={metric.label}
                value={metric.value}
                icon={metric.icon}
                progress={metric.progress}
                caption={metric.caption}
                ring={metric.ring}
              />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
