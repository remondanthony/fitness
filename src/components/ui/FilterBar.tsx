"use client";

import { SlidersHorizontal, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { FilterGroupDef, FilterSelection } from "@/data/types";
import { countActive } from "@/lib/filters";

type FilterBarProps = {
  groups: FilterGroupDef[];
  selection: FilterSelection;
  onToggle: (groupId: string, value: string) => void;
  onClear: () => void;
  /** Optional slot above the filter groups, e.g. a search field. */
  children?: ReactNode;
};

/**
 * Data-driven filter panel. Renders one chip row per group and collapses to a
 * toggle on small screens so the results stay above the fold.
 */
export function FilterBar({
  groups,
  selection,
  onToggle,
  onClear,
  children,
}: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const active = countActive(selection);

  return (
    <Card tone="glass" className="rounded-3xl p-5 sm:p-6">
      {children ? <div className="mb-5">{children}</div> : null}

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="text-accent-500 h-4 w-4" aria-hidden="true" />
          <h2 className="text-chalk text-[11px] font-semibold tracking-[0.24em] uppercase">
            Filters
          </h2>
          {active > 0 ? (
            <Badge variant="accent" size="sm">
              {active} active
            </Badge>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {active > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className="text-fog hover:text-accent-400 inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.1em] uppercase transition-colors"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="filter-groups"
            className="border-chalk/12 text-mist hover:border-chalk/25 hover:text-chalk inline-flex h-9 items-center rounded-full border px-4 text-xs font-semibold tracking-[0.1em] uppercase transition-colors sm:hidden"
          >
            {open ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <div
        id="filter-groups"
        className={cn("mt-6 flex-col gap-6 sm:flex", open ? "flex" : "hidden")}
      >
        {groups.map((group) => (
          <fieldset key={group.id} className="flex flex-col gap-3 sm:flex-row sm:gap-5">
            <legend className="sr-only">{group.label}</legend>
            <p
              aria-hidden="true"
              className="text-fog shrink-0 pt-2 text-[11px] font-semibold tracking-[0.2em] uppercase sm:w-28"
            >
              {group.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.options.map((option) => {
                const checked = (selection[group.id] ?? []).includes(option.value);
                return (
                  <label
                    key={option.value}
                    className={cn(
                      "press cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.06em] select-none",
                      "has-[:focus-visible]:outline-accent-500 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2",
                      checked
                        ? "border-accent-500 bg-accent-500/15 text-accent-400"
                        : "border-chalk/10 bg-chalk/[0.04] text-mist hover:border-chalk/25 hover:text-chalk",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => onToggle(group.id, option.value)}
                      name={group.id}
                      value={option.value}
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
    </Card>
  );
}
