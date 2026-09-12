"use client";

import { ArrowLeft, RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

/** Route-level error boundary. Must be a client component. */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Replace with real reporting once an error service is configured.
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_20%,transparent_75%)]" />
      </div>

      <div className="w-full max-w-md text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10 text-red-400">
          <TriangleAlert className="h-6 w-6" aria-hidden="true" />
        </span>

        <h1 className="font-display text-chalk mt-8 text-4xl sm:text-5xl">
          Something Went Wrong
        </h1>

        <p className="text-mist mt-5 text-sm leading-relaxed">
          This page hit an unexpected error. Trying again usually clears it.
        </p>

        {error.digest ? (
          <p className="text-fog mt-4 font-mono text-[11px]">Ref: {error.digest}</p>
        ) : null}

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="bg-accent-500 hover:bg-accent-400 shadow-glow inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-semibold text-white transition-colors"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Try Again
          </button>

          <Link
            href="/"
            className="border-chalk/15 bg-chalk/5 text-chalk hover:border-chalk/30 inline-flex h-12 items-center justify-center gap-2 rounded-full border px-7 text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
