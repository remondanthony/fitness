"use client";

import { ArrowRight, RotateCcw, Trophy } from "lucide-react";
import Link from "next/link";

import { formatClock, formatNumber } from "@/lib/format";

type WorkoutCompleteProps = {
  title: string;
  elapsedSeconds: number;
  exerciseCount: number;
  setCount: number;
  volumeKg: number;
  onRestart: () => void;
};

/** Celebration screen shown once the final set is logged. */
export function WorkoutComplete({
  title,
  elapsedSeconds,
  exerciseCount,
  setCount,
  volumeKg,
  onRestart,
}: WorkoutCompleteProps) {
  const stats = [
    { value: String(exerciseCount), label: "Exercises" },
    { value: String(setCount), label: "Sets" },
    { value: `${formatNumber(volumeKg)} kg`, label: "Volume" },
  ];

  return (
    <div className="animate-rise flex flex-col items-center text-center">
      <span className="border-accent-500/30 bg-accent-500/12 text-accent-400 shadow-glow motion-safe:animate-check-pop inline-flex h-16 w-16 items-center justify-center rounded-2xl border">
        <Trophy className="h-7 w-7" aria-hidden="true" />
      </span>

      <p
        className="text-accent-400 animate-rise mt-8 text-xs font-semibold tracking-[0.4em] uppercase"
        style={{ animationDelay: "120ms" }}
      >
        {title}
      </p>

      <h1
        className="font-display text-chalk animate-rise mt-5 text-5xl sm:text-6xl lg:text-7xl"
        style={{ animationDelay: "200ms" }}
      >
        Workout
        <br />
        Complete
      </h1>

      <p
        className="font-display text-chalk animate-rise mt-10 text-7xl tabular-nums sm:text-8xl"
        style={{ animationDelay: "420ms" }}
      >
        {formatClock(elapsedSeconds)}
      </p>
      <p
        className="text-fog animate-rise mt-2 text-[11px] font-semibold tracking-[0.24em] uppercase"
        style={{ animationDelay: "500ms" }}
      >
        Total Time
      </p>

      <dl className="border-chalk/8 bg-ink-850 divide-chalk/8 mt-12 grid w-full max-w-xl grid-cols-3 divide-x rounded-3xl border">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="animate-rise px-3 py-7"
            style={{ animationDelay: `${620 + index * 110}ms` }}
          >
            <dd className="font-display text-chalk text-xl sm:text-3xl">{stat.value}</dd>
            <dt className="text-fog mt-2 text-[10px] font-semibold tracking-[0.16em] uppercase">
              {stat.label}
            </dt>
          </div>
        ))}
      </dl>

      <div
        className="animate-rise mt-12 flex flex-col items-center gap-4 sm:flex-row"
        style={{ animationDelay: "980ms" }}
      >
        <Link
          href="/progress"
          className="bg-accent-500 hover:bg-accent-400 shadow-glow group/cta inline-flex h-14 items-center justify-center gap-2 rounded-full px-8 text-sm font-semibold text-white transition-colors"
        >
          View Progress
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1"
            aria-hidden="true"
          />
        </Link>

        <button
          type="button"
          onClick={onRestart}
          className="border-chalk/12 bg-chalk/5 text-mist hover:border-chalk/30 hover:text-chalk inline-flex h-14 items-center justify-center gap-2 rounded-full border px-7 text-sm font-semibold transition-colors"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Train It Again
        </button>
      </div>
    </div>
  );
}
