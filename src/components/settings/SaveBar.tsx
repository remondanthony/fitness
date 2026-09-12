"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { useToast } from "@/components/ui/Toast";

/**
 * Save control for a settings block. There is no backend yet, so it runs the
 * pending state and then says plainly that nothing was stored.
 */
export function SaveBar({ label = "Profile updated" }: { label?: string }) {
  const [state, setState] = useState<"idle" | "saving">("idle");
  const { notify } = useToast();

  async function handleSave() {
    setState("saving");
    await new Promise((resolve) => setTimeout(resolve, 600));
    setState("idle");
    notify({
      tone: "success",
      title: label,
      description: "Held in this browser — saving to your account arrives with the backend.",
    });
  }

  return (
    <div className="border-chalk/8 flex flex-wrap items-center gap-4 border-t pt-6">
      <button
        type="button"
        onClick={handleSave}
        disabled={state === "saving"}
        className="bg-accent-500 hover:bg-accent-400 active:bg-accent-600 shadow-glow press inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold text-white hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
      >
        {state === "saving" ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : null}
        {state === "saving" ? "Saving…" : "Save Changes"}
      </button>

      <p className="text-fog text-xs">Changes are held in the browser only.</p>
    </div>
  );
}
