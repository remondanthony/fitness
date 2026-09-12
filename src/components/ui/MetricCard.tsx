import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";

const valueSizes = {
  md: "text-4xl sm:text-[2.75rem]",
  /** For word values like "Intermediate" that need to stay on one line. */
  sm: "text-2xl sm:text-3xl",
} as const;

type MetricCardProps = {
  /** The headline number, e.g. "10K+" or "4.9/5". */
  value: string;
  label: string;
  icon?: LucideIcon;
  /** `card` is a standalone surface; `bare` sits inside an existing panel. */
  variant?: "card" | "bare";
  size?: keyof typeof valueSizes;
  className?: string;
};

/** A single emphasised statistic. Numbers use the condensed display face. */
export function MetricCard({
  value,
  label,
  icon: Icon,
  variant = "card",
  size = "md",
  className,
}: MetricCardProps) {
  const body = (
    <>
      {Icon ? (
        <span className="border-accent-500/25 bg-accent-500/10 text-accent-400 mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      ) : null}
      <p className={cn("font-display text-chalk", valueSizes[size])}>{value}</p>
      <p className="text-fog mt-2 text-[11px] font-semibold tracking-[0.18em] uppercase">
        {label}
      </p>
    </>
  );

  if (variant === "bare") {
    return <div className={cn("px-2 py-1", className)}>{body}</div>;
  }

  return (
    <Card tone="raised" className={cn("p-6", className)}>
      {body}
    </Card>
  );
}
