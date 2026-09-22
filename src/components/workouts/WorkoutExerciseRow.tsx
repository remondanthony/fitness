import { ArrowUpRight, Timer } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/cn";
import { padIndex } from "@/lib/format";
import type { WorkoutExercise } from "@/data/workouts";

type WorkoutExerciseRowProps = {
  exercise: WorkoutExercise;
  index: number;
  /** Renders the rest interval and coaching note alongside the scheme. */
  detailed?: boolean;
  className?: string;
};

/** One numbered movement inside a workout: 01 · Barbell Bench Press · 4 × 8. */
export function WorkoutExerciseRow({
  exercise,
  index,
  detailed = false,
  className,
}: WorkoutExerciseRowProps) {
  return (
    <div
      className={cn(
        "group border-chalk/8 bg-ink-850 hover:border-accent-500/30 relative flex items-center gap-5 rounded-2xl border p-4 transition-colors duration-300 sm:gap-6 sm:p-5",
        className,
      )}
    >
      <span
        className="font-display text-chalk/15 group-hover:text-accent-500/60 w-10 shrink-0 text-3xl transition-colors duration-300 sm:w-12 sm:text-4xl"
        aria-hidden="true"
      >
        {padIndex(index + 1)}
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="text-chalk truncate text-base font-semibold sm:text-lg">
          {exercise.exerciseSlug ? (
            <Link
              href={`/exercises/${exercise.exerciseSlug}`}
              className="hover:text-accent-400 transition-colors duration-200 before:absolute before:inset-0 before:content-['']"
            >
              {exercise.name}
            </Link>
          ) : (
            exercise.name
          )}
        </h3>

        {detailed ? (
          <p className="text-fog mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold tracking-[0.12em] uppercase">
            <span className="flex items-center gap-1.5">
              <Timer className="h-3 w-3" aria-hidden="true" />
              {exercise.restSeconds}s rest
            </span>
            {exercise.previous ? (
              <span>
                Last:{" "}
                {exercise.previous.weight === null
                  ? `${exercise.previous.reps} reps`
                  : `${exercise.previous.weight} kg × ${exercise.previous.reps}`}
              </span>
            ) : null}
          </p>
        ) : null}

        {detailed && exercise.note ? (
          <p className="text-mist mt-2 text-xs leading-relaxed">{exercise.note}</p>
        ) : null}
      </div>

      <span className="font-display text-accent-400 shrink-0 text-xl sm:text-2xl">
        {exercise.sets} × {exercise.reps}
      </span>

      {exercise.exerciseSlug ? (
        <ArrowUpRight
          className="text-fog group-hover:text-accent-400 hidden h-4 w-4 shrink-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:block"
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
