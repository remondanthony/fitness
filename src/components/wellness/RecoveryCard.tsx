import { Timer } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import type { RecoverySession } from "@/data/wellness";

/** A guided recovery session: duration, focus and what it's made of. */
export function RecoveryCard({
  session,
  index = 0,
}: {
  session: RecoverySession;
  /** Position in a grid — varies the artwork lighting. */
  index?: number;
}) {
  const Icon = session.icon;

  return (
    <Card interactive flush className="group flex h-full flex-col">
      <div className="relative overflow-hidden">
        <ImagePlaceholder
          seed={index}
          variant={session.artwork}
          aspect="photo"
          alt={`${session.title} illustration`}
          className="rounded-none border-0 border-b transition-transform duration-500 ease-out group-hover:scale-[1.02]"
        />
        <div className="absolute top-4 left-4">
          <Badge variant="solid" size="sm" className="gap-1.5">
            <Timer className="h-3 w-3" aria-hidden="true" />
            {session.minutes} min
          </Badge>
        </div>
        <div
          className="from-ink-850 pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t to-transparent"
          aria-hidden="true"
        />
        <span className="border-chalk/10 bg-ink-950/75 text-accent-400 absolute right-4 bottom-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border backdrop-blur-md">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-display text-chalk group-hover:text-accent-400 text-2xl leading-tight transition-colors duration-300">
          {session.title}
        </h3>

        <p className="text-accent-400 mt-2 text-[10px] font-semibold tracking-[0.16em] uppercase">
          {session.focus}
        </p>

        <p className="text-mist mt-4 flex-1 text-sm leading-relaxed">{session.summary}</p>

        <ul className="border-chalk/8 mt-5 flex flex-wrap gap-1.5 border-t pt-4">
          {session.blocks.map((block) => (
            <li
              key={block}
              className="border-chalk/10 bg-chalk/[0.04] text-fog rounded-full border px-2.5 py-1 text-[10px] font-medium"
            >
              {block}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
