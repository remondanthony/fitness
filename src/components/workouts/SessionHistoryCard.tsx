import { ArrowUpRight, CalendarDays, Clock, Layers, ListChecks, RotateCcw } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/Card";
import type { HistoryItem } from "@/components/workouts/history-view";

/**
 * One completed session on the history list.
 *
 * Four figures, all the member's own: when they finished, how long it took,
 * how many sets they logged and how much they moved. A session whose workout
 * has left the catalogue still appears, named by its slug, because it is still
 * something they did.
 */
export function SessionHistoryCard({ item }: { item: HistoryItem }) {
  const stats = [
    { label: "Completed", value: item.completedLabel, icon: CalendarDays },
    { label: "Duration", value: item.durationLabel, icon: Clock },
    { label: "Sets", value: String(item.sets), icon: ListChecks },
    { label: "Volume", value: item.volumeLabel, icon: Layers },
  ];

  return (
    <Card tone="raised" interactive className="group relative p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h3 className="font-display text-chalk group-hover:text-accent-400 text-xl transition-colors duration-300 sm:text-2xl">
          {/* The whole card is the target; the pseudo-element covers it so the
              stats below stay selectable text rather than link content. */}
          <Link
            href={`/workouts/history/${item.id}`}
            className="before:absolute before:inset-0 before:content-['']"
          >
            {item.name}
          </Link>
        </h3>

        <div className="flex items-center gap-3">
          {item.unknownWorkout ? (
            <p className="text-fog text-[10px] font-semibold tracking-[0.16em] uppercase">
              No longer in the catalogue
            </p>
          ) : null}
          <ArrowUpRight
            className="text-fog group-hover:text-accent-400 h-4 w-4 shrink-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </div>
      </div>

      <dl className="border-chalk/8 mt-5 grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="text-fog flex items-center gap-1.5 text-[9px] font-semibold tracking-[0.16em] uppercase">
              <stat.icon className="h-3 w-3" aria-hidden="true" />
              {stat.label}
            </dt>
            <dd className="text-chalk mt-1.5 text-sm font-semibold tabular-nums">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Above the card's own link layer, so it is reachable rather than
          covered by it. Repeating starts a new session; this one is unchanged. */}
      {item.repeatHref ? (
        <div className="relative z-10 mt-5 flex">
          <Link
            href={item.repeatHref}
            className="border-chalk/15 bg-chalk/5 text-chalk hover:border-chalk/30 hover:bg-chalk/10 inline-flex h-10 items-center gap-2 rounded-full border px-4 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Repeat
          </Link>
        </div>
      ) : null}

      {/* Said plainly, because otherwise the volume above quietly understates
          what was lifted. */}
      {item.unmeasuredSets > 0 ? (
        <p className="text-fog mt-4 text-xs leading-relaxed">
          {item.unmeasuredSets} {item.unmeasuredSets === 1 ? "set was" : "sets were"}{" "}
          logged without a weight, so {item.unmeasuredSets === 1 ? "it is" : "they are"}{" "}
          counted above but not included in the volume.
        </p>
      ) : null}
    </Card>
  );
}
