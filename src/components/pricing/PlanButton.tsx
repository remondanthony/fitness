"use client";

import { cn } from "@/lib/cn";
import { useToast } from "@/components/ui/Toast";

type PlanButtonProps = {
  plan: string;
  label: string;
  featured: boolean;
};

/** Plan CTA. Checkout is not connected, and the feedback says exactly that. */
export function PlanButton({ plan, label, featured }: PlanButtonProps) {
  const { notify } = useToast();

  return (
    <button
      type="button"
      onClick={() =>
        notify({
          tone: "info",
          title: "Checkout isn't connected yet",
          description: `The ${plan} plan can't be purchased until payments are set up. Nothing was charged.`,
        })
      }
      className={cn(
        "mt-9 inline-flex h-13 w-full shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5",
        featured
          ? "bg-accent-500 hover:bg-accent-400 active:bg-accent-600 shadow-glow text-white"
          : "border-chalk/15 bg-chalk/5 text-chalk hover:border-chalk/30 hover:bg-chalk/10 border",
      )}
    >
      {label}
    </button>
  );
}
