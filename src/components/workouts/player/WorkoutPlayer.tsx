"use client";

import { ChevronLeft, ChevronRight, RotateCcw, X } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/cn";
import { formatClock, padIndex } from "@/lib/format";
import { useWorkoutSession } from "@/lib/useWorkoutSession";
import { RestTimer } from "@/components/workouts/player/RestTimer";
import { SetLogger } from "@/components/workouts/player/SetLogger";
import { WorkoutComplete } from "@/components/workouts/player/WorkoutComplete";
import type { Workout } from "@/data/workouts";

/**
 * Orchestrates the three player states — logging a set, resting, and the
 * completion summary — on top of the persisted session in `useWorkoutSession`.
 */
export function WorkoutPlayer({ workout }: { workout: Workout }) {
  const session = useWorkoutSession(workout);
  const {
    hydrated,
    currentIndex,
    currentExercise,
    exercises,
    setsFor,
    totals,
    elapsedSeconds,
    isComplete,
    rest,
    direction,
  } = session;

  if (!hydrated || !currentExercise) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <p className="text-fog text-xs font-semibold tracking-[0.3em] uppercase">
          Loading session…
        </p>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="flex flex-1 flex-col px-5 py-12 sm:px-8">
        <div className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center">
          <WorkoutComplete
            title={workout.title}
            elapsedSeconds={elapsedSeconds}
            exerciseCount={totals.exercisesTouched}
            setCount={totals.sets}
            volumeKg={totals.volume}
            onRestart={session.restart}
          />
        </div>
      </div>
    );
  }

  const loggedSets = setsFor(currentExercise.id);
  const completedTotal = totals.sets;
  const plannedTotal = exercises.reduce((sum, exercise) => sum + exercise.sets, 0);

  return (
    <div className="flex flex-1 flex-col">
      {/* Session bar */}
      <header className="border-chalk/8 bg-ink-950/90 sticky top-0 z-20 border-b backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link
            href={`/workouts/${workout.slug}`}
            aria-label="Exit workout"
            className="border-chalk/12 bg-chalk/5 text-mist hover:border-chalk/30 hover:text-chalk inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Link>

          <div className="min-w-0 text-center">
            <p className="text-chalk truncate text-xs font-semibold tracking-[0.18em] uppercase">
              {workout.title}
            </p>
            <p className="text-fog mt-0.5 text-[11px] font-semibold tabular-nums">
              {formatClock(elapsedSeconds)} · {completedTotal}/{plannedTotal} sets
            </p>
          </div>

          <button
            type="button"
            onClick={session.restart}
            aria-label="Restart workout"
            className="border-chalk/12 bg-chalk/5 text-mist hover:border-chalk/30 hover:text-chalk inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Exercise progress */}
        <div className="mx-auto flex w-full max-w-3xl gap-1 px-5 pb-4 sm:px-8">
          {exercises.map((exercise, index) => {
            const done = setsFor(exercise.id).length >= exercise.sets;
            return (
              <span
                key={exercise.id}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-300",
                  done
                    ? "bg-accent-500"
                    : index === currentIndex
                      ? "bg-accent-500/45"
                      : "bg-chalk/10",
                )}
                aria-hidden="true"
              />
            );
          })}
        </div>
      </header>

      {/* overflow-x-clip contains the directional slide without creating a
          scroll container (which `hidden` would). */}
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-x-clip px-5 py-10 sm:px-8 sm:py-14">
        {rest ? (
          <div className="flex flex-1 items-center justify-center">
            <RestTimer
              remaining={rest.remaining}
              total={rest.total}
              paused={rest.paused}
              nextUp={rest.label}
              onPause={session.pauseRest}
              onResume={session.resumeRest}
              onSkip={session.endRest}
              onAddTime={() => session.addRest(30)}
            />
          </div>
        ) : (
          <div
            key={currentExercise.id}
            className={`flex flex-1 flex-col ${
              direction === "next" ? "animate-slide-next" : "animate-slide-prev"
            }`}
          >
            <p className="text-accent-400 text-xs font-semibold tracking-[0.36em] uppercase">
              Exercise {padIndex(currentIndex + 1)} / {padIndex(exercises.length)}
            </p>

            <h1 className="font-display text-chalk mt-5 text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
              {currentExercise.name}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <p className="font-display text-accent-500 text-4xl sm:text-5xl">
                {currentExercise.sets} × {currentExercise.reps}
              </p>
              {currentExercise.previous ? (
                <p className="border-chalk/10 bg-chalk/[0.04] rounded-full border px-4 py-2">
                  <span className="text-fog text-[10px] font-semibold tracking-[0.16em] uppercase">
                    Previous
                  </span>
                  <span className="text-chalk ml-3 text-sm font-semibold">
                    {currentExercise.previous.weight} kg × {currentExercise.previous.reps}
                  </span>
                </p>
              ) : null}
            </div>

            {currentExercise.note ? (
              <p className="text-mist mt-5 max-w-xl text-sm leading-relaxed">
                {currentExercise.note}
              </p>
            ) : null}

            <div className="mt-10">
              <SetLogger
                key={currentExercise.id}
                exercise={currentExercise}
                loggedSets={loggedSets}
                onComplete={session.completeSet}
                onNextExercise={session.next}
                isLastExercise={currentIndex === exercises.length - 1}
              />
            </div>

            {/* Exercise navigation */}
            <div className="border-chalk/8 mt-auto flex items-center justify-between gap-3 border-t pt-6">
              <button
                type="button"
                onClick={session.previous}
                disabled={currentIndex === 0}
                className="text-mist enabled:hover:text-chalk enabled:hover:bg-chalk/5 -mx-2 inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Previous
              </button>

              {currentIndex === exercises.length - 1 ? (
                <button
                  type="button"
                  onClick={session.finish}
                  className="text-fog hover:text-accent-400 inline-flex min-h-11 items-center px-2 text-xs font-semibold tracking-[0.16em] uppercase transition-colors"
                >
                  Finish Workout
                </button>
              ) : null}

              <button
                type="button"
                onClick={session.next}
                disabled={currentIndex === exercises.length - 1}
                className="text-mist enabled:hover:text-chalk enabled:hover:bg-chalk/5 -mx-2 inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors disabled:opacity-30"
              >
                Next
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
