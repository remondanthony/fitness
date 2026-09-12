"use client";

import { Check, ListChecks, ShoppingCart, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { ingredientCategories, type Ingredient } from "@/data/nutrition";

/** Only the serializable parts of a meal are needed to build the list. */
export type ShoppingListMeal = { slot: string; ingredients: Ingredient[] };

/**
 * Builds a shopping list from the day's meals on demand. Items can be ticked
 * off in place — state only, nothing is sent anywhere.
 */
export function ShoppingList({ meals }: { meals: ShoppingListMeal[] }) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);

  const grouped = useMemo(() => {
    const items = meals.flatMap((meal) =>
      meal.ingredients.map((ingredient) => ({ ...ingredient, meal: meal.slot })),
    );

    return ingredientCategories
      .map((category) => ({
        category,
        items: items.filter((item) => item.category === category),
      }))
      .filter((group) => group.items.length > 0);
  }, [meals]);

  const total = grouped.reduce((sum, group) => sum + group.items.length, 0);

  const toggle = (key: string) =>
    setChecked((current) =>
      current.includes(key)
        ? current.filter((entry) => entry !== key)
        : [...current, key],
    );

  return (
    <div>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="shopping-list"
          className="bg-accent-500 hover:bg-accent-400 active:bg-accent-600 shadow-glow group/btn inline-flex h-12 items-center gap-2.5 rounded-full px-6 text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:-translate-y-0.5"
        >
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          {open ? "Hide Shopping List" : "Generate Shopping List"}
        </button>

        {open ? (
          <p className="text-fog text-xs font-semibold tracking-[0.16em] uppercase">
            {checked.length} of {total} picked up
          </p>
        ) : null}
      </div>

      <div id="shopping-list" hidden={!open} className="mt-6">
        <Card tone="raised" className="animate-rise">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-display text-chalk flex items-center gap-3 text-2xl">
              <ListChecks className="text-accent-500 h-5 w-5" aria-hidden="true" />
              Shopping List
            </h3>
            {checked.length > 0 ? (
              <button
                type="button"
                onClick={() => setChecked([])}
                className="text-fog hover:text-accent-400 inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.1em] uppercase transition-colors"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Reset
              </button>
            ) : null}
          </div>

          <p className="text-mist mt-3 text-sm">
            Everything today&apos;s four meals need, grouped by aisle.
          </p>

          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {grouped.map((group) => (
              <div key={group.category}>
                <h4 className="text-accent-400 border-chalk/8 border-b pb-3 text-[10px] font-semibold tracking-[0.24em] uppercase">
                  {group.category}
                </h4>
                <ul className="mt-4 flex flex-col gap-1">
                  {group.items.map((item) => {
                    const key = `${group.category}-${item.name}`;
                    const isChecked = checked.includes(key);
                    return (
                      <li key={key}>
                        <label
                          className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 transition-colors select-none",
                            "has-[:focus-visible]:outline-accent-500 has-[:focus-visible]:outline-2",
                            isChecked ? "opacity-45" : "hover:bg-chalk/[0.04]",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggle(key)}
                            className="sr-only"
                          />
                          <span
                            className={cn(
                              "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                              isChecked
                                ? "border-accent-500 bg-accent-500 text-white"
                                : "border-chalk/25",
                            )}
                            aria-hidden="true"
                          >
                            {isChecked ? <Check className="h-3 w-3" /> : null}
                          </span>
                          <span className="min-w-0">
                            <span
                              className={cn(
                                "text-chalk block text-sm",
                                isChecked && "line-through",
                              )}
                            >
                              {item.name}
                            </span>
                            <span className="text-fog block text-xs">{item.quantity}</span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
