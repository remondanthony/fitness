import { ArrowUpRight, Dumbbell } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import type { Exercise } from "@/data/exercises";

/** Library tile: artwork, name, primary muscle, equipment and difficulty. */
export function ExerciseCard({
  exercise,
  index = 0,
}: {
  exercise: Exercise;
  /** Position in a grid — varies the artwork lighting. */
  index?: number;
}) {
  return (
    <Card interactive flush className="group flex h-full flex-col">
      <div className="relative overflow-hidden">
        <ImagePlaceholder
          seed={index}
          variant={exercise.artwork}
          aspect="photo"
          alt={`${exercise.name} illustration`}
          className="rounded-none border-0 border-b transition-transform duration-500 ease-out group-hover:scale-[1.02]"
        />
        <div className="absolute top-4 left-4">
          <Badge variant="solid" size="sm">
            {exercise.difficulty}
          </Badge>
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
              href={`/exercises/${exercise.slug}`}
              className="before:absolute before:inset-0 before:content-['']"
            >
              {exercise.name}
            </Link>
          </h3>
          <ArrowUpRight
            className="text-fog group-hover:text-accent-400 mt-1 h-4 w-4 shrink-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </div>

        <p className="text-accent-400 mt-2 text-xs font-semibold tracking-[0.14em] uppercase">
          {exercise.primaryMuscle}
        </p>

        <p className="text-mist mt-4 flex-1 text-sm leading-relaxed">{exercise.summary}</p>

        <div className="border-chalk/8 text-fog mt-5 flex items-center gap-2 border-t pt-4 text-[10px] font-semibold tracking-[0.16em] uppercase">
          <Dumbbell className="text-accent-500 h-3.5 w-3.5" aria-hidden="true" />
          {exercise.equipmentLabel}
        </div>
      </div>
    </Card>
  );
}
