import { ArrowRight, ListChecks, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { hoursSince } from "@/lib/progress/resume";
import type { ResumableSession } from "@/lib/data/workout-sessions";

/**
 * Offers to pick up a workout the member walked away from.
 *
 * Every figure here is read from the session itself: the workout name from the
 * catalogue entry its slug points at, the set count from the rows actually
 * logged, and the elapsed time from `started_at`. Nothing is estimated — in
 * particular there is no completion percentage, because the dashboard has no
 * honest way to know how much of the session is left without reading the plan
 * and the logs together, and guessing would be inventing progress.
 *
 * The action is the ordinary start route for that workout. The player already
 * finds the open session for a slug and restores its logged sets, so resuming
 * is the existing flow reached from a new place rather than a second one.
 *
 * `workoutTitle` is null when the slug is no longer in the catalogue, which the
 * card reports plainly rather than hiding — the session still happened.
 */
export function ResumeSessionCard({
  session,
  workoutTitle,
  now,
}: {
  session: ResumableSession;
  workoutTitle: string | null;
  now: Date;
}) {
  const elapsedHours = hoursSince(session.startedAt, now);

  const startedLabel =
    elapsedHours === null
      ? null
      : elapsedHours < 1
        ? "Started less than an hour ago"
        : `Started ${elapsedHours} ${elapsedHours === 1 ? "hour" : "hours"} ago`;

  return (
    <Card
      tone="raised"
      className="border-accent-500/25 flex flex-col gap-5 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <p className="text-accent-400 flex items-center gap-2 text-[10px] font-semibold tracking-[0.24em] uppercase">
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Unfinished Workout
        </p>

        <h2 className="font-display text-chalk mt-3 text-2xl break-words sm:text-3xl">
          {workoutTitle ?? session.workoutSlug}
        </h2>

        {workoutTitle === null ? (
          <p className="text-fog mt-2 text-xs">
            This workout is no longer in the catalogue.
          </p>
        ) : null}

        <p className="text-mist mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {startedLabel ? <span>{startedLabel}</span> : null}
          <span className="flex items-center gap-1.5">
            <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
            {session.loggedSets} {session.loggedSets === 1 ? "set" : "sets"} logged
          </span>
        </p>
      </div>

      <Button href={`/workouts/${session.workoutSlug}/start`} size="lg" className="shrink-0">
        Resume Workout
        <ArrowRight
          className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
          aria-hidden="true"
        />
      </Button>
    </Card>
  );
}
