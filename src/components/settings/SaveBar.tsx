"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";

import { useToast } from "@/components/ui/Toast";
import type { SaveResult } from "@/lib/actions/account";

/**
 * Save control for a settings block.
 *
 * Runs the caller's Server Action and reports the real outcome: a toast on
 * success, an inline message on failure. It never claims a save that the
 * database rejected.
 */
export function SaveBar({
  onSave,
  hint = "Saved to your account.",
}: {
  onSave: () => Promise<SaveResult>;
  hint?: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useToast();

  async function handleSave() {
    setPending(true);
    setError(null);

    const result = await onSave();

    setPending(false);

    if (result.status === "error") {
      setError(result.message);
      return;
    }

    notify({ tone: "success", title: result.message });
  }

  return (
    <div className="border-chalk/8 flex flex-col gap-4 border-t pt-6">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="bg-accent-500 hover:bg-accent-400 active:bg-accent-600 shadow-glow press inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold text-white hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : null}
          {pending ? "Saving…" : "Save Changes"}
        </button>

        <p className="text-fog text-xs">{hint}</p>
      </div>

      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-300"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
