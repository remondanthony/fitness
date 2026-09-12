"use client";

import { Loader2 } from "lucide-react";
import { useLinkStatus } from "next/link";
import type { ReactNode } from "react";

/**
 * Swaps a link's label while the navigation it triggered is in flight.
 * Driven by Next's real navigation state — there is no artificial delay, so
 * on an instant navigation the swap simply never appears.
 */
export function LinkPending({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const { pending } = useLinkStatus();

  if (!pending) return <>{children}</>;

  return (
    <>
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      {label}
    </>
  );
}
