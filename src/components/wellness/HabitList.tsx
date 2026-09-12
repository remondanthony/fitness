"use client";

import { Check } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { Habit } from "@/data/wellness";

/**
 * A habit with its icon already rendered. Icon components are functions, which
 * cannot cross the server/client boundary, so the server page renders them and
 * passes the resulting element.
 */
export type HabitView = Omit<Habit, "icon"> & { icon: ReactNode };

/** Today's habits, tickable in place. State only — nothing is persisted. */
export function HabitList({ habits }: { habits: HabitView[] }) {
  const [completed, setCompleted] = useState<string[]>(() =>
    habits.filter((habit) => habit.completed).map((habit) => habit.id),
  );

  const toggle = (id: string) =>
    setCompleted((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id],
    );

  const done = completed.length;
  const percent = Math.round((done / habits.length) * 100);

  return (
    <Card tone="raised" className="p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-chalk text-[11px] font-semibold tracking-[0.28em] uppercase">
          Today&apos;s Habits
        </h2>
        <p className="text-fog text-[11px] font-semibold tracking-[0.16em] uppercase">
          <span className="text-accent-400">{done}</span> / {habits.length} complete
        </p>
      </div>

      <div
        className="bg-chalk/8 mt-5 h-1.5 w-full overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Habits completed today"
      >
        <span
          className="from-accent-600 to-accent-400 block h-full rounded-full bg-gradient-to-r transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ul className="mt-7 flex flex-col gap-3">
        {habits.map((habit) => {
          const isDone = completed.includes(habit.id);

          return (
            <li key={habit.id}>
              <label
                className={cn(
                  "press flex cursor-pointer items-center gap-4 rounded-2xl border p-4 select-none",
                  "has-[:focus-visible]:outline-accent-500 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2",
                  isDone
                    ? "border-accent-500/30 bg-accent-500/8"
                    : "border-chalk/10 bg-chalk/[0.03] hover:border-chalk/25",
                )}
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => toggle(habit.id)}
                  className="sr-only"
                />

                <span
                  className={cn(
                    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300",
                    isDone
                      ? "border-accent-500 bg-accent-500 text-white"
                      : "border-chalk/12 bg-chalk/5 text-fog",
                  )}
                  aria-hidden="true"
                >
                  {isDone ? (
                    <Check className="motion-safe:animate-check-pop h-5 w-5" />
                  ) : (
                    habit.icon
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-sm font-semibold transition-colors",
                      isDone ? "text-mist line-through" : "text-chalk",
                    )}
                  >
                    {habit.title}
                  </span>
                  <span className="text-fog mt-0.5 block text-xs leading-relaxed">
                    {habit.detail}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
