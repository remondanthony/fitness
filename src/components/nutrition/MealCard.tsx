import { Card } from "@/components/ui/Card";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { formatNumber } from "@/lib/format";
import type { Meal } from "@/data/nutrition";

/** One meal in today's plan, with its macro split. */
export function MealCard({
  meal,
  index = 0,
}: {
  meal: Meal;
  /** Position in a grid — varies the artwork lighting. */
  index?: number;
}) {
  const Icon = meal.icon;

  const macros = [
    { label: "Cal", value: formatNumber(meal.macros.calories) },
    { label: "Protein", value: `${meal.macros.protein}g` },
    { label: "Carbs", value: `${meal.macros.carbs}g` },
    { label: "Fat", value: `${meal.macros.fat}g` },
  ];

  return (
    <Card interactive flush className="group flex h-full flex-col">
      <div className="relative overflow-hidden">
        <ImagePlaceholder
          seed={index}
          variant={meal.artwork}
          aspect="photo"
          alt={`${meal.title} illustration`}
          className="rounded-none border-0 border-b transition-transform duration-500 ease-out group-hover:scale-[1.02]"
        />
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="border-chalk/10 bg-ink-950/75 text-chalk inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase backdrop-blur-md">
            <Icon className="text-accent-500 h-3 w-3" aria-hidden="true" />
            {meal.slot}
          </span>
        </div>
        <div
          className="from-ink-850 pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t to-transparent"
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-fog text-[10px] font-semibold tracking-[0.18em] uppercase">
          {meal.time}
        </p>

        <h3 className="font-display text-chalk group-hover:text-accent-400 mt-2 text-2xl leading-tight transition-colors duration-300">
          {meal.title}
        </h3>

        <p className="text-mist mt-3 flex-1 text-sm leading-relaxed">{meal.summary}</p>

        <dl className="border-chalk/8 divide-chalk/8 mt-6 grid grid-cols-4 divide-x border-t pt-4">
          {macros.map((macro) => (
            <div key={macro.label} className="px-1 text-center first:pl-0 last:pr-0">
              <dd className="font-display text-chalk text-lg">{macro.value}</dd>
              <dt className="text-fog mt-1 text-[9px] font-semibold tracking-[0.12em] uppercase">
                {macro.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  );
}
