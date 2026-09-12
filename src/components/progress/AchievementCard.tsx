import { Check, Lock } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { Achievement } from "@/data/progress";

/** Badge tile — earned achievements light up, locked ones show progress. */
export function AchievementCard({ achievement }: { achievement: Achievement }) {
  const { icon: Icon, earned, progress } = achievement;
  const percent = progress === undefined ? undefined : Math.round(progress * 100);

  return (
    <Card
      tone="raised"
      interactive
      className={cn(
        "group flex h-full flex-col p-6 text-center",
        earned && "border-accent-500/25",
      )}
    >
      <span
        className={cn(
          "mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl border transition-all duration-300",
          earned
            ? "border-accent-500/35 bg-accent-500/12 text-accent-400 shadow-glow group-hover:bg-accent-500 group-hover:text-white"
            : "border-chalk/10 bg-chalk/[0.04] text-fog",
        )}
      >
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>

      <h3 className="font-display text-chalk mt-6 text-xl">{achievement.title}</h3>

      <p className="text-mist mt-3 flex-1 text-xs leading-relaxed">
        {achievement.description}
      </p>

      {!earned && percent !== undefined ? (
        <div
          className="bg-chalk/8 mt-5 h-1.5 w-full overflow-hidden rounded-full"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${achievement.title} progress`}
        >
          <span
            className="bg-accent-500/70 bar-grow block h-full rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>
      ) : null}

      <p
        className={cn(
          "mt-5 inline-flex items-center justify-center gap-1.5 text-[10px] font-semibold tracking-[0.16em] uppercase",
          earned ? "text-accent-400" : "text-fog",
        )}
      >
        {earned ? (
          <Check className="h-3 w-3" aria-hidden="true" />
        ) : (
          <Lock className="h-3 w-3" aria-hidden="true" />
        )}
        {achievement.detail}
      </p>
    </Card>
  );
}
