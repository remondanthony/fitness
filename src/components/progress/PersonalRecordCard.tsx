import { ArrowUpRight, TrendingUp } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/Card";
import type { PersonalRecord } from "@/data/progress";

/** A single lifetime best, with the jump that set it. */
export function PersonalRecordCard({ record }: { record: PersonalRecord }) {
  return (
    <Card tone="raised" interactive className="group flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-chalk group-hover:text-accent-400 text-sm font-semibold transition-colors duration-300">
          {record.exerciseSlug ? (
            <Link
              href={`/exercises/${record.exerciseSlug}`}
              className="before:absolute before:inset-0 before:content-['']"
            >
              {record.lift}
            </Link>
          ) : (
            record.lift
          )}
        </h3>
        {record.exerciseSlug ? (
          <ArrowUpRight
            className="text-fog group-hover:text-accent-400 h-4 w-4 shrink-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        ) : null}
      </div>

      <p className="mt-5 flex items-baseline gap-2">
        <span className="font-display text-chalk text-5xl">{record.value}</span>
        <span className="text-fog text-xs font-semibold tracking-[0.2em] uppercase">
          {record.unit}
        </span>
      </p>

      <div className="border-chalk/8 mt-6 flex items-center justify-between gap-3 border-t pt-4">
        <span className="text-accent-400 inline-flex items-center gap-1.5 text-xs font-semibold">
          <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
          {record.delta}
        </span>
        <span className="text-fog text-[10px] font-semibold tracking-[0.14em] uppercase">
          {record.achieved}
        </span>
      </div>
    </Card>
  );
}
