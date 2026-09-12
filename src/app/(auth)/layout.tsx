import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/layout/Logo";

/**
 * Minimal chrome for authentication: the wordmark, a way back to the site, and
 * a single centred column. No navigation to wander off into.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="bg-grid absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_20%,transparent_75%)]" />
        <div className="bg-accent-500/15 absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full blur-[150px]" />
        <div className="bg-accent-700/10 absolute -bottom-40 left-1/4 h-[26rem] w-[26rem] rounded-full blur-[150px]" />
      </div>

      <header className="px-5 py-6 sm:px-8">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
          <Logo />
          <Link
            href="/"
            className="text-fog hover:text-chalk inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] uppercase transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to site
          </Link>
        </div>
      </header>

      <main id="main" className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="px-5 py-8 sm:px-8">
        <p className="text-fog mx-auto max-w-5xl text-center text-[11px] tracking-[0.1em]">
          © {new Date().getFullYear()} STRONGER · Train. Recover. Eat.
        </p>
      </footer>
    </div>
  );
}
