import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { StarRating } from "@/components/ui/StarRating";
import type { Coach } from "@/data/coaching";

/** Coach tile: portrait, specialty, and the three numbers people compare. */
export function CoachCard({
  coach,
  index = 0,
}: {
  coach: Coach;
  /** Position in a grid — varies the artwork lighting. */
  index?: number;
}) {
  const stats = [
    { label: "Experience", value: `${coach.yearsExperience} yrs` },
    { label: "Rating", value: coach.rating.toFixed(1) },
    { label: "Clients", value: `${coach.clients}+` },
  ];

  return (
    <Card interactive flush className="group flex h-full flex-col">
      <div className="relative overflow-hidden">
        <ImagePlaceholder
          seed={index}
          variant={coach.artwork}
          aspect="photo"
          alt={`Portrait illustration of ${coach.name}`}
          className="rounded-none border-0 border-b transition-transform duration-500 ease-out group-hover:scale-[1.02]"
        />
        <div className="absolute top-4 left-4">
          <Badge variant="solid" size="sm">
            {coach.specialty}
          </Badge>
        </div>
        <div
          className="from-ink-850 pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t to-transparent"
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <h3 className="font-display text-chalk group-hover:text-accent-400 text-3xl transition-colors duration-300">
          <Link
            href={`/coaching/${coach.slug}`}
            className="before:absolute before:inset-0 before:content-['']"
          >
            {coach.name}
          </Link>
        </h3>

        <p className="text-accent-400 mt-2 text-xs font-semibold tracking-[0.14em] uppercase">
          {coach.specialty}
        </p>

        <p className="text-mist mt-4 flex-1 text-sm leading-relaxed">{coach.tagline}</p>

        <div className="mt-6 flex items-center gap-2.5">
          <StarRating value={coach.rating} />
          <span className="text-chalk text-sm font-semibold">
            {coach.rating.toFixed(1)}
          </span>
          <span className="text-fog inline-flex items-center gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            {coach.clients}+ clients
          </span>
        </div>

        <dl className="border-chalk/8 divide-chalk/8 mt-6 grid grid-cols-3 divide-x border-t pt-5">
          {stats.map((stat) => (
            <div key={stat.label} className="px-1 text-center first:pl-0 last:pr-0">
              <dd className="font-display text-chalk text-xl">{stat.value}</dd>
              <dt className="text-fog mt-1 text-[9px] font-semibold tracking-[0.14em] uppercase">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>

        <p className="text-accent-400 mt-6 inline-flex items-center gap-2 text-sm font-semibold">
          View Coach
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </p>
      </div>
    </Card>
  );
}
