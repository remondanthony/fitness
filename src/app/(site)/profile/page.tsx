import { ArrowRight, CalendarDays, Mail, Settings } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { getAccountView } from "@/lib/data/account-view";
import { profile, profileDetailMeta } from "@/data/profile";
import { getProgram } from "@/data/programs";
import { getTrainingSummary } from "@/lib/data/progress-analytics";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your account details, training preferences and current program.",
};

export default async function ProfilePage() {
  // The route is protected, so a member is always present here.
  const [view, training] = await Promise.all([getAccountView(), getTrainingSummary()]);

  // The snapshot used to show invented figures. These four are the member's
  // own, taken from completed sessions; a failed read shows a dash rather than
  // a zero, because "no workouts" and "we could not look" are different things.
  const unread = "—";
  const snapshot = [
    {
      id: "workouts",
      label: "Workouts",
      value: training.error ? unread : formatNumber(training.data.totalSessions),
    },
    {
      id: "volume",
      label: "Total Volume",
      value: training.error ? unread : `${formatNumber(training.data.totalVolume)} kg`,
    },
    {
      id: "streak",
      label: "Current Streak",
      value: training.error ? unread : `${training.data.streak.current}`,
    },
    {
      id: "best-streak",
      label: "Best Streak",
      value: training.error ? unread : `${training.data.streak.longest}`,
    },
  ];
  const currentProgram = getProgram(profile.currentProgramSlug);

  const email = view?.email ?? "";
  const displayName = view?.displayName ?? "Your profile";

  // Values the member has not set yet read as "Not set" rather than being
  // filled with invented defaults.
  const details = [
    { ...profileDetailMeta.goal, value: view?.goalLabel },
    { ...profileDetailMeta.level, value: view?.levelLabel },
    { ...profileDetailMeta.equipment, value: view?.equipmentLabel },
    { ...profileDetailMeta.frequency, value: view?.frequencyLabel },
  ];
  const hasAnyDetail = details.some((detail) => detail.value);

  return (
    <>
      {/* Identity */}
      <section className="border-chalk/8 relative overflow-hidden border-b pt-10 pb-14 lg:pt-14 lg:pb-16">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="bg-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_0%,#000_20%,transparent_78%)]" />
          <div className="bg-accent-500/12 absolute -top-52 left-1/4 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full blur-[140px]" />
        </div>

        <Container>
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-10">
            {/* Avatar placeholder */}
            <div className="relative shrink-0">
              <div
                className="bg-accent-500/25 absolute -inset-3 -z-10 rounded-[2rem] blur-2xl"
                aria-hidden="true"
              />
              {view?.avatarUrl ? (
                // Not next/image: a short-lived signed URL to a private object
                // is not something the optimiser can usefully cache.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={view.avatarUrl}
                  alt={`Profile picture for ${displayName}`}
                  width={160}
                  height={160}
                  className="border-chalk/12 h-32 w-32 rounded-3xl border object-cover sm:h-40 sm:w-40"
                />
              ) : (
                <ImagePlaceholder
                  variant="profile"
                  aspect="square"
                  alt={`Profile picture placeholder for ${displayName}`}
                  className="h-32 w-32 rounded-3xl sm:h-40 sm:w-40"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="gap-1.5">
                  <CalendarDays className="h-3 w-3" aria-hidden="true" />
                  {view?.memberSince
                    ? `Since ${new Date(view.memberSince).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}`
                    : "Signed in"}
                </Badge>
              </div>

              <h1 className="font-display text-chalk mt-5 text-5xl break-words sm:text-6xl">
                {displayName}
              </h1>

              <p className="text-mist mt-3 flex items-center gap-2.5 text-sm">
                <Mail className="text-fog h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="break-all">{email}</span>
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button href="/profile/settings">
                  <Settings className="h-4 w-4" aria-hidden="true" />
                  Edit Profile
                </Button>
                <Button href="/dashboard" variant="secondary">
                  Go To Dashboard
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                    aria-hidden="true"
                  />
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Training profile */}
      <section className="py-14 lg:py-20">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-fog text-[11px] font-semibold tracking-[0.28em] uppercase">
              Training Profile
            </h2>
            {!hasAnyDetail ? (
              <Link
                href="/profile/settings#preferences"
                className="text-accent-400 hover:text-accent-300 text-xs font-semibold transition-colors"
              >
                Set your preferences →
              </Link>
            ) : null}
          </div>

          <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {details.map((detail) => (
              <Card key={detail.id} tone="raised" className="p-6">
                <dt className="text-fog flex min-h-[2.1rem] items-start gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase">
                  <detail.icon
                    className="text-accent-500 mt-px h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  {detail.label}
                </dt>
                <dd
                  className={
                    detail.value
                      ? "font-display text-chalk mt-4 text-2xl leading-tight"
                      : "font-display text-fog mt-4 text-2xl leading-tight"
                  }
                >
                  {detail.value ?? "Not set"}
                </dd>
                <p className="text-fog mt-4 text-xs leading-relaxed">{detail.hint}</p>
              </Card>
            ))}
          </dl>

          {/* Snapshot */}
          <Card tone="glass" flush className="mt-6 rounded-3xl">
            <dl className="divide-chalk/8 grid grid-cols-2 divide-x divide-y lg:grid-cols-4 lg:divide-y-0">
              {snapshot.map((stat) => (
                <div key={stat.id} className="p-6 text-center sm:p-7">
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
        </Container>
      </section>

      {/* Current program */}
      {currentProgram ? (
        <section className="border-chalk/8 bg-ink-900 border-t py-16 lg:py-20">
          <Container>
            <SectionHeading
              size="md"
              eyebrow="In Progress"
              title="Current Program."
              description="The block you are working through right now."
              action={
                <Button href="/programs" variant="secondary" className="hidden md:inline-flex">
                  Browse Programs
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                    aria-hidden="true"
                  />
                </Button>
              }
            />

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <ProgramCard program={currentProgram} />
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
