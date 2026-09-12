import { ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { formatNumber } from "@/lib/format";
import { workoutMetaIcons, type Workout } from "@/data/workouts";

type WorkoutCardProps = {
  workout: Workout;
  /** Position in a grid — varies the artwork lighting. */
  index?: number;
  /** `recent` surfaces the last completed session instead of the plan. */
  variant?: "recommended" | "recent";
};

/** Compact workout tile used by the Recent and Recommended shelves. */
export function WorkoutCard({
  workout,
  variant = "recommended",
  index = 0,
}: WorkoutCardProps) {
  const completed = variant === "recent" ? workout.lastCompleted : undefined;
  const DurationIcon = workoutMetaIcons.duration;
  const ExercisesIcon = workoutMetaIcons.exercises;

  return (
    <Card interactive flush className="group flex h-full flex-col">
      <div className="relative overflow-hidden">
        <ImagePlaceholder
          seed={index}
          variant={workout.artwork}
          aspect="photo"
          alt={`${workout.title} artwork`}
          className="rounded-none border-0 border-b transition-transform duration-500 ease-out group-hover:scale-[1.02]"
        />
        <div className="absolute top-4 left-4">
          {completed ? (
            <Badge className="bg-ink-950/80 gap-1.5 backdrop-blur-md">
              <Check className="text-accent-500 h-3 w-3" aria-hidden="true" />
              {completed.date}
            </Badge>
          ) : (
            <Badge variant="solid" size="sm">
              {workout.level}
            </Badge>
          )}
        </div>
        <div
          className="from-ink-850 pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t to-transparent"
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-chalk group-hover:text-accent-400 text-2xl transition-colors duration-300">
            <Link
              href={`/workouts/${workout.slug}`}
              className="before:absolute before:inset-0 before:content-['']"
            >
              {workout.title}
            </Link>
          </h3>
          <ArrowUpRight
            className="text-fog group-hover:text-accent-400 mt-1 h-4 w-4 shrink-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </div>

        <p className="text-accent-400 mt-2 text-xs font-semibold tracking-[0.14em] uppercase">
          {workout.focus}
        </p>

        <p className="text-mist mt-4 flex-1 text-sm leading-relaxed">{workout.summary}</p>

        {completed ? (
          <dl className="border-chalk/8 mt-5 grid grid-cols-3 gap-3 border-t pt-4">
            {[
              { label: "Time", value: `${completed.minutes} min` },
              { label: "Sets", value: String(completed.sets) },
              { label: "Volume", value: `${formatNumber(completed.volumeKg)} kg` },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="text-fog text-[9px] font-semibold tracking-[0.16em] uppercase">
                  {stat.label}
                </dt>
                <dd className="text-chalk mt-1 text-sm font-semibold">{stat.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="border-chalk/8 text-fog mt-5 flex items-center gap-4 border-t pt-4 text-[10px] font-semibold tracking-[0.16em] uppercase">
            <span className="flex items-center gap-1.5">
              <DurationIcon className="text-accent-500 h-3.5 w-3.5" aria-hidden="true" />
              {workout.estimatedMinutes} min
            </span>
            <span className="flex items-center gap-1.5">
              <ExercisesIcon className="text-accent-500 h-3.5 w-3.5" aria-hidden="true" />
              {workout.exercises.length} exercises
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
