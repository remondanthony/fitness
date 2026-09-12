import { ArrowRight, Compass } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

import { Logo } from "@/components/layout/Logo";

export const metadata: Metadata = {
  title: "Page Not Found",
};

const suggestions = [
  { href: "/programs", label: "Programs" },
  { href: "/exercises", label: "Exercise Library" },
  { href: "/workouts", label: "Workouts" },
  { href: "/dashboard", label: "Dashboard" },
];

/** Global 404. Lives outside the site chrome, so it carries its own. */
export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="bg-grid absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_20%,transparent_75%)]" />
        <div className="bg-accent-500/15 absolute -top-40 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full blur-[150px]" />
      </div>

      <header className="px-5 py-6 sm:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <Logo />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-xl text-center">
          <p className="font-display text-chalk/10 text-[7rem] leading-none sm:text-[10rem]">
            404
          </p>

          <h1 className="font-display text-chalk -mt-4 text-4xl sm:text-5xl">
            Page Not Found
          </h1>

          <p className="text-mist mt-5 text-sm leading-relaxed sm:text-base">
            The path you&apos;re looking for doesn&apos;t exist. It may have moved, or the
            link that brought you here might be out of date.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="bg-accent-500 hover:bg-accent-400 shadow-glow group/cta inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-semibold text-white transition-colors"
            >
              Back to Home
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>

          <div className="border-chalk/8 mt-12 border-t pt-8">
            <h2 className="text-fog flex items-center justify-center gap-2 text-[10px] font-semibold tracking-[0.24em] uppercase">
              <Compass className="h-3.5 w-3.5" aria-hidden="true" />
              Try one of these
            </h2>
            <ul className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {suggestions.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="border-chalk/10 bg-chalk/[0.04] text-mist hover:border-accent-500/40 hover:text-accent-400 inline-flex h-10 items-center rounded-full border px-4 text-xs font-semibold transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
