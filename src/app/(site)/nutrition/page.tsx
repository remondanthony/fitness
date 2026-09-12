import { UtensilsCrossed } from "lucide-react";
import type { Metadata } from "next";

import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CalorieCalculator } from "@/components/nutrition/CalorieCalculator";
import { MacroCard } from "@/components/nutrition/MacroCard";
import { MealCard } from "@/components/nutrition/MealCard";
import { ShoppingList } from "@/components/nutrition/ShoppingList";
import { formatNumber } from "@/lib/format";
import { macroTargets, sumMacros, todaysMeals } from "@/data/nutrition";

export const metadata: Metadata = {
  title: "Nutrition",
  description:
    "Daily targets, a calorie estimator and a simple meal plan built around your training.",
};

export default function NutritionPage() {
  const totals = sumMacros(todaysMeals);

  const totalRow = [
    { label: "Calories", value: `${formatNumber(totals.calories)} kcal` },
    { label: "Protein", value: `${totals.protein}g` },
    { label: "Carbs", value: `${totals.carbs}g` },
    { label: "Fat", value: `${totals.fat}g` },
  ];

  return (
    <>
      <PageHero
        eyebrow="Nutrition"
        title="Fuel Your Body."
        description="Targets that match your training, a plan for the day and a list for the shop. Nothing to weigh out to the gram."
      />

      {/* Daily targets */}
      <section className="py-14 lg:py-20">
        <Container>
          <h2 className="text-fog text-[11px] font-semibold tracking-[0.28em] uppercase">
            Today&apos;s Targets
          </h2>

          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {macroTargets.map((macro) => (
              <li key={macro.id}>
                <MacroCard macro={macro} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Calculator */}
      <section className="border-chalk/8 bg-ink-900 border-y py-16 lg:py-20">
        <Container>
          <SectionHeading
            size="md"
            eyebrow="Estimate"
            title="Find Your Number."
            description="Answer five questions for a starting point. Treat the result as an estimate to test, not a rule to obey."
          />

          <div className="mt-12">
            <CalorieCalculator />
          </div>
        </Container>
      </section>

      {/* Meal plan */}
      <section className="py-16 lg:py-24">
        <Container>
          <SectionHeading
            size="md"
            eyebrow="Meal Plan"
            title={
              <span className="flex items-center gap-4">
                <UtensilsCrossed className="text-accent-500 h-7 w-7" aria-hidden="true" />
                Today&apos;s Meals
              </span>
            }
            description="Four meals that hit the day's targets without a spreadsheet."
          />

          {/* Day total */}
          <Card tone="glass" flush className="mt-10 rounded-3xl">
            <dl className="divide-chalk/8 grid grid-cols-2 divide-x divide-y sm:grid-cols-4 sm:divide-y-0">
              {totalRow.map((total) => (
                <div key={total.label} className="p-6 text-center sm:p-7">
                  <dd className="font-display text-chalk text-2xl sm:text-3xl">
                    {total.value}
                  </dd>
                  <dt className="text-fog mt-2 text-[10px] font-semibold tracking-[0.18em] uppercase">
                    {total.label}
                  </dt>
                </div>
              ))}
            </dl>
          </Card>

          <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {todaysMeals.map((meal) => (
              <li key={meal.id}>
                <MealCard meal={meal} />
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <ShoppingList
              meals={todaysMeals.map((meal) => ({
                slot: meal.slot,
                ingredients: meal.ingredients,
              }))}
            />
          </div>
        </Container>
      </section>
    </>
  );
}
