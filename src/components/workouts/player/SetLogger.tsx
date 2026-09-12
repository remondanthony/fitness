"use client";

import { Check, Minus, Plus } from "lucide-react";
import { useId, useState } from "react";

import { cn } from "@/lib/cn";
import type { LoggedSet } from "@/lib/useWorkoutSession";
import type { WorkoutExercise } from "@/data/workouts";

type SetLoggerProps = {
  exercise: WorkoutExercise;
  loggedSets: LoggedSet[];
  onComplete: (weight: number, reps: number) => void;
  onNextExercise: () => void;
  isLastExercise: boolean;
};

type StepperProps = {
  label: string;
  unit: string;
  value: number;
  step: number;
  min?: number;
  onChange: (value: number) => void;
};

/** Large touch-friendly numeric control for logging weight and reps. */
function Stepper({ label, unit, value, step, min = 0, onChange }: StepperProps) {
  const id = useId();
  const clamp = (next: number) => Math.max(min, Math.round(next * 100) / 100);

  return (
    <div className="border-chalk/10 bg-ink-850 rounded-2xl border p-4 sm:p-5">
      <label
        htmlFor={id}
        className="text-fog text-[10px] font-semibold tracking-[0.2em] uppercase"
      >
        {label}
      </label>

      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onChange(clamp(value - step))}
          aria-label={`Decrease ${label}`}
          className="border-chalk/12 bg-chalk/5 text-chalk hover:border-chalk/30 hover:bg-chalk/10 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors active:scale-95"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex min-w-0 flex-1 items-baseline justify-center gap-1.5">
          <input
            id={id}
            type="number"
            inputMode="decimal"
            value={value}
            min={min}
            step={step}
            onChange={(event) => {
              const next = Number(event.target.value);
              onChange(Number.isFinite(next) ? clamp(next) : 0);
            }}
            className="font-display text-chalk focus-visible:outline-accent-500 focus-visible:outline-2 focus-visible:outline-offset-2 w-full min-w-0 rounded-lg bg-transparent text-center text-4xl  sm:text-5xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="text-fog shrink-0 text-xs font-semibold tracking-[0.14em] uppercase">
            {unit}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onChange(clamp(value + step))}
          aria-label={`Increase ${label}`}
          className="border-chalk/12 bg-chalk/5 text-chalk hover:border-chalk/30 hover:bg-chalk/10 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors active:scale-95"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/** Weight/reps entry plus the primary Complete Set action. */
export function SetLogger({
  exercise,
  loggedSets,
  onComplete,
  onNextExercise,
  isLastExercise,
}: SetLoggerProps) {
  // The player remounts this component per exercise (keyed by exercise id), so
  // the initial values always come from that exercise's previous performance.
  const targetReps = Number.parseInt(exercise.reps, 10);
  const [weight, setWeight] = useState(exercise.previous?.weight ?? 0);
  const [reps, setReps] = useState(
    exercise.previous?.reps ?? (Number.isFinite(targetReps) ? targetReps : 10),
  );

  const done = loggedSets.length >= exercise.sets;

  return (
    <div className="flex flex-col gap-5">
      {/* Set progress */}
      <ol className="flex flex-wrap items-center gap-2" aria-label="Sets completed">
        {Array.from({ length: exercise.sets }, (_, index) => {
          const logged = loggedSets[index];
          return (
            <li key={index} className="flex-1">
              <div
                className={cn(
                  "flex h-14 flex-col items-center justify-center rounded-xl border text-center transition-colors duration-300",
                  logged
                    ? "border-accent-500/40 bg-accent-500/12"
                    : "border-chalk/10 bg-chalk/[0.03]",
                )}
              >
                {logged ? (
                  <>
                    <span className="text-accent-400 text-xs font-semibold">
                      {logged.weight} × {logged.reps}
                    </span>
                    <span className="text-fog text-[9px] font-semibold tracking-[0.12em] uppercase">
                      Set {index + 1}
                    </span>
                  </>
                ) : (
                  <span className="text-fog text-[10px] font-semibold tracking-[0.16em] uppercase">
                    Set {index + 1}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {done ? (
        <div className="border-accent-500/25 bg-accent-500/8 rounded-2xl border p-6 text-center">
          <p className="font-display text-chalk text-2xl">All Sets Complete</p>
          <p className="text-mist mt-2 text-sm">
            {isLastExercise
              ? "That is the last exercise — finish the session below."
              : "Move on when you are ready."}
          </p>
          {!isLastExercise ? (
            <button
              type="button"
              onClick={onNextExercise}
              className="bg-accent-500 hover:bg-accent-400 shadow-glow mt-5 inline-flex h-12 items-center justify-center rounded-full px-7 text-sm font-semibold text-white transition-colors"
            >
              Next Exercise
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Stepper
              label="Weight"
              unit="kg"
              value={weight}
              step={2.5}
              onChange={setWeight}
            />
            <Stepper label="Reps" unit="reps" value={reps} step={1} onChange={setReps} />
          </div>

          <button
            type="button"
            onClick={() => onComplete(weight, reps)}
            className="bg-accent-500 hover:bg-accent-400 active:bg-accent-600 shadow-glow font-display flex h-16 w-full items-center justify-center gap-3 rounded-2xl text-2xl text-white transition-colors sm:h-18 sm:text-3xl"
          >
            Complete Set
            <Check className="h-6 w-6" aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
}
