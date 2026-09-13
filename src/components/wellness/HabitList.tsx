"use client";

import { AlertCircle, Check, Sparkles } from "lucide-react";
import { useState, useTransition, type ReactNode } from "react";

import { Card } from "@/components/ui/Card";
import { toggleHabitAction } from "@/lib/actions/daily";
import { cn } from "@/lib/cn";

/** A habit as the list renders it. Icons are rendered by the server page. */
export type HabitView = {
  id: string;
  title: string;
  detail: string;
  completed: boolean;
  icon: ReactNode;
};

/**
 * Today's habits, tickable in place and saved as you go.
 *
 * The tick updates immediately so the list stays responsive, then the write
 * happens behind it. If the database refuses, the tick is rolled back and the
 * reason is shown — a habit is never left looking saved when it is not.
 */
export function HabitList({ habits }: { habits: HabitView[] }) {
  const [completed, setCompleted] = useState<string[]>(() =>
    habits.filter((habit) => habit.completed).map((habit) => habit.id),
  );
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function toggle(id: string) {
    const nextCompleted = !completed.includes(id);

    // Optimistic, with a rollback below if the write is refused.
    setCompleted((current) =>
      nextCompleted ? [...current, id] : current.filter((entry) => entry !== id),
    );
    setError(null);

    startTransition(async () => {
      const result = await toggleHabitAction({ habitId: id, completed: nextCompleted });

      if (result.status === "error") {
        setCompleted((current) =>
          nextCompleted ? current.filter((entry) => entry !== id) : [...current, id],
        );
        setError(result.message);
      }
    });
  }

  const done = completed.length;
  const percent = habits.length === 0 ? 0 : Math.round((done / habits.length) * 100);

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

      {error ? (
        <p
          role="alert"
          className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-300"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}

      {habits.length === 0 ? (
        <div className="border-chalk/10 bg-chalk/[0.03] mt-7 flex flex-col items-center rounded-2xl border py-10 text-center">
          <span className="border-chalk/10 bg-chalk/5 text-fog inline-flex h-12 w-12 items-center justify-center rounded-xl border">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="text-chalk font-display mt-4 text-xl">No habits yet</p>
          <p className="text-mist mt-2 max-w-xs text-xs leading-relaxed">
            Your daily habits will appear here once they are set up.
          </p>
        </div>
      ) : null}

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
