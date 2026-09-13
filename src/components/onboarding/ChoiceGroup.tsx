"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/cn";
import type { PersonalizationOption } from "@/lib/personalization";

/**
 * A single-choice question rendered as cards.
 *
 * Each card is a real `<input type="radio">` inside its `<label>`, grouped in a
 * `<fieldset>`. That buys arrow-key navigation, the correct screen-reader
 * announcement and form semantics from the browser — none of which a div with
 * a click handler would have.
 *
 * Selection is shown three ways: an accent border, a filled check mark and the
 * label's weight. Colour alone never carries it.
 */
export function ChoiceGroup<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  columns = 2,
}: {
  name: string;
  /** The question. Rendered by the step heading, so hidden from sight here. */
  legend: string;
  options: readonly PersonalizationOption<T>[];
  value: string;
  onChange: (value: T) => void;
  columns?: 1 | 2;
}) {
  return (
    <fieldset className="min-w-0 border-0 p-0">
      <legend className="sr-only">{legend}</legend>

      <div
        className={cn(
          "grid gap-3",
          columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-1",
        )}
      >
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <label
              key={option.value}
              className={cn(
                "press group/choice relative flex cursor-pointer items-start gap-4 rounded-2xl border p-4 text-left select-none sm:p-5",
                "has-[:focus-visible]:outline-accent-500 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2",
                selected
                  ? "border-accent-500/50 bg-accent-500/8"
                  : "border-chalk/10 bg-chalk/[0.03] hover:border-chalk/25 hover:bg-chalk/[0.05]",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />

              <span
                className={cn(
                  "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
                  selected
                    ? "border-accent-500 bg-accent-500 text-white"
                    : "border-chalk/25 bg-chalk/5 text-transparent",
                )}
                aria-hidden="true"
              >
                <Check className="motion-safe:animate-check-pop h-3 w-3" />
              </span>

              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-sm transition-colors",
                    selected ? "text-chalk font-semibold" : "text-mist font-medium",
                  )}
                >
                  {option.label}
                </span>
                <span className="text-fog mt-1 block text-xs leading-relaxed">
                  {option.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
