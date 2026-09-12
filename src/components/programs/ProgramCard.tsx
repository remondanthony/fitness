import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { programMetaIcons, type Program } from "@/data/programs";

type ProgramCardProps = {
  program: Program;
  /**
   * `preview` is the compact homepage treatment; `full` adds equipment and a
   * call to action for the programs library.
   */
  variant?: "preview" | "full";
};

/** Program tile used by both the homepage preview and the programs library. */
export function ProgramCard({ program, variant = "full" }: ProgramCardProps) {
  const href = `/programs/${program.slug}`;

  const meta =
    variant === "preview"
      ? [
          { key: "duration", value: program.duration, icon: programMetaIcons.duration },
          { key: "level", value: program.level, icon: programMetaIcons.level },
          { key: "frequency", value: program.frequency, icon: programMetaIcons.frequency },
        ]
      : [
          { key: "level", value: program.level, icon: programMetaIcons.level },
          { key: "duration", value: program.duration, icon: programMetaIcons.duration },
          { key: "frequency", value: program.frequency, icon: programMetaIcons.frequency },
          { key: "equipment", value: program.equipmentLabel, icon: programMetaIcons.equipment },
        ];

  return (
    <Card interactive flush className="group flex h-full flex-col">
      <div className="relative">
        <ImagePlaceholder
          variant={program.artwork}
          aspect="photo"
          alt={`${program.title} program artwork`}
          className="rounded-none border-0 border-b"
        />
        <div className="absolute top-4 left-4">
          <Badge variant="solid" size="sm">
            {program.level}
          </Badge>
        </div>
        <div
          className="from-ink-850 pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t to-transparent"
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <h3 className="font-display text-chalk group-hover:text-accent-400 text-3xl transition-colors duration-300">
          {variant === "full" ? (
            <Link href={href} className="before:absolute before:inset-0 before:content-['']">
              {program.title}
            </Link>
          ) : (
            program.title
          )}
        </h3>

        <p className="text-mist mt-3 flex-1 text-sm leading-relaxed">{program.summary}</p>

        <ul
          className={
            variant === "preview"
              ? "border-chalk/8 mt-6 grid grid-cols-3 gap-3 border-t pt-5"
              : "border-chalk/8 mt-6 grid grid-cols-2 gap-4 border-t pt-5"
          }
        >
          {meta.map((item) => (
            <li key={item.key} className="flex flex-col gap-2">
              <item.icon className="text-accent-500 h-4 w-4" aria-hidden="true" />
              <span className="text-fog text-[10px] leading-tight font-semibold tracking-[0.1em] uppercase">
                {item.value}
              </span>
            </li>
          ))}
        </ul>

        {variant === "full" ? (
          <p className="text-accent-400 mt-6 inline-flex items-center gap-2 text-sm font-semibold">
            View Program
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </p>
        ) : null}
      </div>
    </Card>
  );
}
