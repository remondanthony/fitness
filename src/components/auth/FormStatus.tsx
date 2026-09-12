import { AlertCircle, CheckCircle2, Info } from "lucide-react";

import { cn } from "@/lib/cn";
import type { AuthResult } from "@/lib/auth/types";

const tones = {
  success: {
    icon: CheckCircle2,
    className: "border-accent-500/30 bg-accent-500/10 text-accent-300",
  },
  error: {
    icon: AlertCircle,
    className: "border-red-500/30 bg-red-500/10 text-red-300",
  },
  unavailable: {
    icon: Info,
    className: "border-chalk/12 bg-chalk/5 text-mist",
  },
} as const;

/** Renders the outcome of a submission. */
export function FormStatus({ result }: { result: AuthResult | null }) {
  if (!result) return null;

  const tone = tones[result.status];
  const Icon = tone.icon;
  const message = result.status === "success" ? "Signed in." : result.message;

  return (
    <p
      role="status"
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-4 py-3 text-xs leading-relaxed",
        tone.className,
      )}
    >
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}
