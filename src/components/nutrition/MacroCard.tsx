import { Card } from "@/components/ui/Card";
import { formatNumber } from "@/lib/format";
import type { MacroTarget } from "@/data/nutrition";

/**
 * One daily macro target, with how much of it has been logged so far.
 *
 * `logged` is null until the member records the figure. An unlogged macro
 * shows an em dash and an empty bar rather than a zero, which would read as
 * "you ate nothing" instead of "you haven't said yet".
 */
export function MacroCard({
  macro,
  logged,
}: {
  macro: MacroTarget;
  logged: number | null;
}) {
  const percent = logged === null ? 0 : Math.min(100, Math.round((logged / macro.value) * 100));
  const Icon = macro.icon;

  return (
    <Card tone="raised" className="flex h-full flex-col p-6">
      <p className="text-fog flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase">
        <Icon className="text-accent-500 h-3.5 w-3.5" aria-hidden="true" />
        {macro.label}
      </p>

      <p className="mt-4 flex items-baseline gap-2">
        <span className="font-display text-chalk text-4xl sm:text-5xl">
          {formatNumber(macro.value)}
        </span>
        <span className="text-fog text-xs font-semibold tracking-[0.18em] uppercase">
          {macro.unit}
        </span>
      </p>

      <div className="mt-auto pt-6">
        <div className="text-fog flex items-baseline justify-between text-[10px] font-semibold tracking-[0.14em] uppercase">
          <span>Logged today</span>
          <span className="text-chalk">
            {logged === null ? "—" : `${formatNumber(logged)} ${macro.unit}`}
          </span>
        </div>

        <div
          className="bg-chalk/8 mt-3 h-1.5 w-full overflow-hidden rounded-full"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${macro.label} logged today`}
        >
          <span
            className="from-accent-600 to-accent-400 bar-grow block h-full rounded-full bg-gradient-to-r"
            style={{ width: `${percent}%` }}
          />
        </div>

        <p className="text-fog mt-3 text-xs leading-relaxed">{macro.caption}</p>
      </div>
    </Card>
  );
}
