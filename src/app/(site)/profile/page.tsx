import { ArrowRight, CalendarDays, Mail, Settings, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { getSessionUser } from "@/lib/auth/session";
import { profile, profileDetails } from "@/data/profile";
import { getProgram } from "@/data/programs";
import { progressStats } from "@/data/progress";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your account details, training preferences and current program.",
};

export default async function ProfilePage() {
  // The route is protected, so a user is always present here.
  const user = await getSessionUser();
  const currentProgram = getProgram(profile.currentProgramSlug);

  const email = user?.email ?? "";
  // Prefer the name captured at sign-up; otherwise use the local part of the
  // email rather than inventing one.
  const displayName = user?.displayName ?? email.split("@")[0] ?? "Your profile";

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
              <ImagePlaceholder
                variant="profile"
                aspect="square"
                alt={`Profile picture placeholder for ${displayName}`}
                className="h-32 w-32 rounded-3xl sm:h-40 sm:w-40"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent" className="gap-1.5">
                  <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                  {profile.plan} member
                </Badge>
                <Badge variant="outline" className="gap-1.5">
                  <CalendarDays className="h-3 w-3" aria-hidden="true" />
                  Signed in
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
          <h2 className="text-fog text-[11px] font-semibold tracking-[0.28em] uppercase">
            Training Profile
          </h2>

          <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {profileDetails.map((detail) => (
              <Card key={detail.id} tone="raised" className="p-6">
                <dt className="text-fog flex min-h-[2.1rem] items-start gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase">
                  <detail.icon
                    className="text-accent-500 mt-px h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  {detail.label}
                </dt>
                <dd className="font-display text-chalk mt-4 text-2xl leading-tight">
                  {detail.value}
                </dd>
                <p className="text-fog mt-4 text-xs leading-relaxed">{detail.hint}</p>
              </Card>
            ))}
          </dl>

          {/* Snapshot */}
          <Card tone="glass" flush className="mt-6 rounded-3xl">
            <dl className="divide-chalk/8 grid grid-cols-2 divide-x divide-y lg:grid-cols-4 lg:divide-y-0">
              {progressStats.map((stat) => (
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
