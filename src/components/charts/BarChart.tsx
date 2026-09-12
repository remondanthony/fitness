import { cn } from "@/lib/cn";
import type { SeriesPoint } from "@/data/progress";

type BarChartProps = {
  data: SeriesPoint[];
  /** Draws a dashed goal line across the plot. */
  target?: number;
  /** Overrides the auto y maximum. */
  max?: number;
  unit?: string;
  className?: string;
};

/**
 * CSS-driven bar chart — no SVG needed for rectangles, and the bars stay crisp
 * and fully responsive. Bars marked `current` render as an in-progress period.
 */
export function BarChart({ data, target, max, unit = "", className }: BarChartProps) {
  const ceiling = max ?? Math.max(...data.map((point) => point.value), target ?? 0);
  const gridValues = Array.from({ length: ceiling + 1 }, (_, index) => index).reverse();

  return (
    <figure className={cn("flex flex-col gap-4", className)}>
      <div className="flex gap-3">
        {/* Y axis */}
        <ul
          className="text-fog flex h-52 shrink-0 flex-col justify-between text-[10px] font-semibold tabular-nums sm:h-60"
          aria-hidden="true"
        >
          {gridValues.map((value) => (
            <li key={value} className="-translate-y-1/2 first:translate-y-0 last:-translate-y-full">
              {value}
            </li>
          ))}
        </ul>

        <div className="relative h-52 min-w-0 flex-1 sm:h-60">
          {/* Grid */}
          <div className="absolute inset-0 flex flex-col justify-between" aria-hidden="true">
            {gridValues.map((value) => (
              <span key={value} className="bg-chalk/8 h-px w-full" />
            ))}
          </div>

          {/* Target line */}
          {target !== undefined ? (
            <div
              className="border-accent-500/45 absolute inset-x-0 border-t border-dashed"
              style={{ bottom: `${(target / ceiling) * 100}%` }}
              aria-hidden="true"
            >
              <span className="text-accent-400 bg-ink-900 absolute -top-2 right-0 px-1.5 text-[9px] font-semibold tracking-[0.12em] uppercase">
                Target {target}
              </span>
            </div>
          ) : null}

          {/* Bars */}
          <ol className="absolute inset-0 flex items-end gap-1.5 sm:gap-2">
            {data.map((point) => (
              <li key={point.label} className="group flex h-full flex-1 items-end">
                <div
                  className={cn(
                    "w-full rounded-t-md transition-all duration-300",
                    point.current
                      ? "bg-accent-500/35 border-accent-500 border-t-2"
                      : point.value >= (target ?? Infinity)
                        ? "bg-accent-500 group-hover:bg-accent-400"
                        : "bg-chalk/15 group-hover:bg-chalk/25",
                  )}
                  style={{ height: `${Math.max((point.value / ceiling) * 100, 2)}%` }}
                  title={`${point.label}: ${point.value}${unit}${point.current ? " (in progress)" : ""}`}
                />
              </li>
            ))}
          </ol>
        </div>
      </div>

      <ul className="text-fog flex items-center gap-1.5 pl-8 text-[10px] font-semibold tracking-[0.06em] uppercase sm:gap-2">
        {data.map((point, index) => (
          <li
            key={point.label}
            className={cn(
              "flex-1 text-center",
              index % 2 === 1 && "hidden sm:block",
              point.current && "text-accent-400",
            )}
          >
            {point.label}
          </li>
        ))}
      </ul>
    </figure>
  );
}
