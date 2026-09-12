"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/Card";

type ErrorStateProps = {
  title?: string;
  description?: string;
  /** Retry handler. Omit to render without the retry action. */
  onRetry?: () => void;
  action?: ReactNode;
};

/** Reusable in-page failure state, for a section that could not load. */
export function ErrorState({
  title = "Something went wrong.",
  description = "We couldn't load this section. Trying again usually clears it.",
  onRetry,
  action,
}: ErrorStateProps) {
  return (
    <Card tone="raised" className="flex flex-col items-center py-14 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10 text-red-400">
        <TriangleAlert className="h-6 w-6" aria-hidden="true" />
      </span>

      <h3 className="font-display text-chalk mt-6 text-2xl">{title}</h3>
      <p className="text-mist mt-3 max-w-sm text-sm leading-relaxed">{description}</p>

      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="border-chalk/15 bg-chalk/5 text-chalk hover:border-chalk/30 hover:bg-chalk/10 press mt-7 inline-flex h-11 items-center gap-2 rounded-full border px-6 text-sm font-semibold"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Try Again
        </button>
      ) : null}

      {action ? <div className="mt-7">{action}</div> : null}
    </Card>
  );
}
