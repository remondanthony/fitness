"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

/** Full-width primary action with a pending state. */
export function SubmitButton({
  pending,
  pendingLabel,
  children,
}: {
  pending: boolean;
  /** Replaces the label while the request is in flight. */
  pendingLabel?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-accent-500 hover:bg-accent-400 active:bg-accent-600 shadow-glow press inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl text-sm font-semibold text-white hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
