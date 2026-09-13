import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Logo } from "@/components/layout/Logo";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { getSessionUser } from "@/lib/auth/session";
import { getPersonalization } from "@/lib/data/personalization";
import { toAnswers } from "@/lib/personalization";

export const metadata: Metadata = {
  title: "Set Up Your Training",
  description: "Five questions so STRONGER can shape training around you.",
  robots: { index: false, follow: false },
};

/**
 * Onboarding.
 *
 * Open to any signed-in member, including one who has already finished — §10
 * asks that completing it not lock the door behind them. That is also what
 * keeps the pairing with /dashboard loop-free: the dashboard sends incomplete
 * members here, and this page never sends anyone back on load.
 */
export default async function OnboardingPage() {
  const user = await getSessionUser();

  // The proxy guards this prefix; this is the second line, for a session that
  // expires between the proxy check and the render.
  if (!user) redirect("/login?next=/onboarding");

  const view = await getPersonalization();
  if (!view) redirect("/login?next=/onboarding");

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="bg-grid absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_20%,transparent_75%)]" />
        <div className="bg-accent-500/12 absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full blur-[150px]" />
      </div>

      <header className="px-5 py-6 sm:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <Logo />
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center px-5 pt-4 pb-16 sm:px-8">
        <div className="w-full max-w-3xl">
          <OnboardingFlow
            initial={toAnswers(view.state)}
            alreadyComplete={view.complete}
            loadError={view.loadError}
          />
        </div>
      </div>
    </div>
  );
}
