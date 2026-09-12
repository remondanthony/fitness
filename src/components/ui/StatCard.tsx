import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/charts/ProgressRing";
import { cn } from "@/lib/cn";

type StatCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  /** 0–1 completion against the metric's goal. */
  progress?: number;
  caption?: string;
  /** Shows the value in a ring instead of a bar. */
  ring?: boolean;
  className?: string;
};

/** One daily metric: icon, label, value and progress toward its goal. */
export function StatCard({
  label,
  value,
  icon: Icon,
  progress,
  caption,
  ring = false,
  className,
}: StatCardProps) {
  const percent = progress === undefined ? undefined : Math.round(progress * 100);

  return (
    <Card
      tone="raised"
      interactive
      className={cn("group flex flex-col gap-5 p-5 sm:p-6", className)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-fog flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase">
            <Icon
              className="text-accent-500 h-3.5 w-3.5 shrink-0"
              aria-hidden="true"
            />
            {label}
          </p>
          {!ring ? (
            <p
              className={cn(
                "font-display text-chalk mt-3",
                // Long values like "8,420 / 10,000" need to stay on one line
                // in the narrow five-column layout.
                value.length > 12
                  ? "text-2xl"
                  : value.length > 9
                    ? "text-2xl sm:text-3xl"
                    : "text-3xl sm:text-4xl",
              )}
            >
              {value}
            </p>
          ) : null}
        </div>

        {ring ? <ProgressRing value={progress ?? 0} label={value} size={76} /> : null}
      </div>

      <div className="mt-auto flex flex-col gap-2.5">
        {!ring && percent !== undefined ? (
          <div
            className="bg-chalk/8 h-1.5 w-full overflow-hidden rounded-full"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${label} progress`}
          >
            <span
              className="from-accent-600 to-accent-400 block h-full rounded-full bg-gradient-to-r transition-[width] duration-500"
              style={{ width: `${Math.min(100, percent)}%` }}
            />
          </div>
        ) : null}

        {caption ? (
          <p className="text-fog text-xs leading-relaxed">{caption}</p>
        ) : null}
      </div>
    </Card>
  );
}
