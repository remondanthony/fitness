import { ArrowRight, Play } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { totalSets, type Workout } from "@/data/workouts";

/** The dashboard's primary call to action: start the session planned for today. */
export function TodayWorkoutCard({ workout }: { workout: Workout }) {
  const stats = [
    { value: String(workout.estimatedMinutes), label: "Min" },
    { value: String(workout.exercises.length), label: "Exercises" },
    { value: String(totalSets(workout)), label: "Sets" },
  ];

  return (
    <Card tone="raised" flush className="h-full overflow-hidden rounded-3xl">
      <div className="grid h-full sm:grid-cols-2">
        <div className="relative">
          {/* Ratio-driven on mobile, stretched to the row height from sm up. */}
          <ImagePlaceholder
            variant={workout.artwork}
            aspect="photo"
            alt={`${workout.title} artwork`}
            className="w-full rounded-none border-0 sm:absolute sm:inset-0 sm:aspect-auto sm:h-full"
          />
          <div
            className="from-ink-800 pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t to-transparent sm:inset-y-0 sm:right-0 sm:left-auto sm:h-auto sm:w-20 sm:bg-gradient-to-l"
            aria-hidden="true"
          />
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-8">
          <Badge variant="accent" className="w-fit gap-2">
            <span className="bg-accent-500 h-1.5 w-1.5 rounded-full" aria-hidden="true" />
            Today&apos;s Workout
          </Badge>

          <h2 className="font-display text-chalk mt-5 text-3xl sm:text-4xl lg:text-5xl">
            {workout.title}
          </h2>

          <p className="text-mist mt-4 text-sm leading-relaxed">{workout.summary}</p>

          <dl className="mt-7 flex flex-wrap items-baseline gap-x-7 gap-y-3">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-baseline gap-2">
                <dd className="font-display text-chalk text-3xl">{stat.value}</dd>
                <dt className="text-fog text-[10px] font-semibold tracking-[0.2em] uppercase">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href={`/workouts/${workout.slug}/start`} size="lg">
              <Play className="h-4 w-4" aria-hidden="true" />
              Start Workout
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                aria-hidden="true"
              />
            </Button>
            <Button href={`/workouts/${workout.slug}`} size="lg" variant="secondary">
              View Details
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
