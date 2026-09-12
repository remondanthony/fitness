"use client";

import { Check, Pause, Play, Plus, SkipForward } from "lucide-react";

import { cn } from "@/lib/cn";

import { formatClock } from "@/lib/format";

type RestTimerProps = {
  remaining: number;
  total: number;
  paused: boolean;
  /** Name of the exercise that follows this rest, if any. */
  nextUp?: string;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onAddTime: () => void;
};

/** Full-bleed rest countdown with a progress ring and pause/skip controls. */
export function RestTimer({
  remaining,
  total,
  paused,
  nextUp,
  onPause,
  onResume,
  onSkip,
  onAddTime,
}: RestTimerProps) {
  const radius = 132;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? Math.min(1, Math.max(0, remaining / total)) : 0;
  const finished = remaining <= 0;
  const urgent = !finished && remaining <= 10;

  return (
    <div className="animate-rise flex flex-col items-center text-center">
      <p
        className={cn(
          "text-xs font-semibold tracking-[0.4em] uppercase transition-colors duration-300",
          finished ? "text-accent-300" : "text-accent-400",
        )}
      >
        {finished ? "Rest Complete" : "Rest"}
      </p>

      <div className="relative mt-8 flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
        <svg
          viewBox="0 0 300 300"
          className="absolute inset-0 h-full w-full -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx="150"
            cy="150"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-chalk/8"
          />
          <circle
            cx="150"
            cy="150"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            className={cn(
              "transition-[stroke-dashoffset,color] duration-1000 ease-linear",
              urgent ? "text-accent-300" : "text-accent-500",
            )}
          />
        </svg>

        <div>
          {finished ? (
            <span className="border-accent-500/35 bg-accent-500/12 text-accent-400 animate-check-pop mx-auto flex h-20 w-20 items-center justify-center rounded-full border">
              <Check className="h-9 w-9" aria-hidden="true" />
            </span>
          ) : (
            <p
              className={cn(
                "font-display text-7xl tabular-nums sm:text-8xl",
                urgent ? "text-accent-400 motion-safe:animate-urgent" : "text-chalk",
              )}
              role="timer"
              aria-live="off"
            >
              {formatClock(remaining)}
            </p>
          )}
          <p className="text-fog mt-3 text-[11px] font-semibold tracking-[0.2em] uppercase">
            {finished ? "Back to work" : paused ? "Paused" : urgent ? "Almost" : "Recovering"}
          </p>
        </div>
      </div>

      {nextUp ? (
        <p className="text-mist mt-8 text-sm">
          <span className="text-fog text-[10px] font-semibold tracking-[0.2em] uppercase">
            Next up
          </span>
          <br />
          <span className="text-chalk mt-1 inline-block text-base font-semibold">
            {nextUp}
          </span>
        </p>
      ) : null}

      <div
        className="mt-10 flex flex-wrap items-center justify-center gap-3"
        hidden={finished}
      >
        <button
          type="button"
          onClick={paused ? onResume : onPause}
          className="border-chalk/12 bg-chalk/5 text-chalk hover:border-chalk/30 hover:bg-chalk/10 press inline-flex h-12 items-center gap-2 rounded-full border px-6 text-sm font-semibold"
        >
          {paused ? (
            <Play className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Pause className="h-4 w-4" aria-hidden="true" />
          )}
          {paused ? "Resume" : "Pause"}
        </button>

        <button
          type="button"
          onClick={onAddTime}
          className="border-chalk/12 bg-chalk/5 text-chalk hover:border-chalk/30 hover:bg-chalk/10 press inline-flex h-12 items-center gap-2 rounded-full border px-6 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          30s
        </button>

        <button
          type="button"
          onClick={onSkip}
          className="bg-accent-500 hover:bg-accent-400 shadow-glow press inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold text-white"
        >
          <SkipForward className="h-4 w-4" aria-hidden="true" />
          Skip Rest
        </button>
      </div>
    </div>
  );
}
