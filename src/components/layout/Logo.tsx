import Link from "next/link";

import { cn } from "@/lib/cn";

/** Wordmark: condensed uppercase with an accent stroke marking the "STR". */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group/logo inline-flex items-center gap-2.5 rounded-md",
        className,
      )}
      aria-label="STRONGER — home"
    >
      <span className="relative flex h-8 w-8 items-center justify-center" aria-hidden="true">
        <span className="bg-accent-500 absolute inset-0 rounded-[10px] opacity-90 transition-opacity duration-300 group-hover/logo:opacity-100" />
        <span className="bg-accent-300/60 absolute inset-0 rounded-[10px] blur-md" />
        <svg viewBox="0 0 24 24" className="relative h-4 w-4 text-white" fill="currentColor">
          <rect x="2" y="9.5" width="20" height="5" rx="2.5" />
          <rect x="0.5" y="6" width="4" height="12" rx="1.6" opacity="0.9" />
          <rect x="19.5" y="6" width="4" height="12" rx="1.6" opacity="0.9" />
        </svg>
      </span>
      <span className="font-display text-chalk text-2xl leading-none tracking-[0.02em]">
        Strong<span className="text-accent-500">er</span>
      </span>
    </Link>
  );
}
