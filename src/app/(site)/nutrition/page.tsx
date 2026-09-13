import { AlertCircle, ArrowRight, UtensilsCrossed } from "lucide-react";
import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CalorieCalculator } from "@/components/nutrition/CalorieCalculator";
import { MacroCard } from "@/components/nutrition/MacroCard";
import { MealCard } from "@/components/nutrition/MealCard";
import { NutritionLogForm } from "@/components/nutrition/NutritionLogForm";
import { ShoppingList } from "@/components/nutrition/ShoppingList";
import { getSessionUser } from "@/lib/auth/session";
import { currentLogDate, formatLogDate } from "@/lib/data/daily-date";
import { getNutritionLog } from "@/lib/data/nutrition";
import { formatNumber } from "@/lib/format";
import { emptyMacros, macroTargets, sumMacros, todaysMeals, type LoggedMacros } from "@/data/nutrition";

export const metadata: Metadata = {
  title: "Nutrition",
  description:
    "Daily targets, a calorie estimator and a simple meal plan built around your training.",
};

export default async function NutritionPage() {
  const totals = sumMacros(todaysMeals);
  const logDate = currentLogDate();
  const user = await getSessionUser();

  // Signed-out visitors see the targets and the plan, but no figures and no
  // way to log — the page never shows numbers that aren't the reader's own.
  const log = user ? await getNutritionLog(logDate) : null;
  const row = log?.data ?? null;

  const logged: LoggedMacros = row
    ? {
        calories: row.calories,
        protein: row.protein_g,
        carbs: row.carbs_g,
        fat: row.fat_g,
      }
    : emptyMacros;

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
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-fog text-[11px] font-semibold tracking-[0.28em] uppercase">
              Today&apos;s Targets
            </h2>
            <p className="text-fog text-[11px] font-semibold tracking-[0.16em] uppercase">
              {formatLogDate(logDate)}
            </p>
          </div>

          {log?.error ? (
            <p
              role="alert"
              className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-300"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              We couldn&apos;t load today&apos;s log. Refresh to try again.
            </p>
          ) : null}

          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {macroTargets.map((macro) => (
              <li key={macro.id}>
                <MacroCard macro={macro} logged={logged[macro.id]} />
              </li>
            ))}
          </ul>

          <div className="mt-6">
            {user ? (
              <NutritionLogForm logged={logged} />
            ) : (
              <Card tone="raised" className="flex flex-wrap items-center justify-between gap-5 p-6 sm:p-7">
                <div className="min-w-0">
                  <h3 className="text-chalk text-[11px] font-semibold tracking-[0.24em] uppercase">
                    Log Today
                  </h3>
                  <p className="text-fog mt-2 text-xs leading-relaxed">
                    Sign in to record what you&apos;ve eaten — your totals are saved to your account.
                  </p>
                </div>
                <Button href="/login?next=/nutrition" variant="secondary" className="shrink-0">
                  Sign In
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                    aria-hidden="true"
                  />
                </Button>
              </Card>
            )}
          </div>
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
            {todaysMeals.map((meal, index) => (
              <li key={meal.id}>
                <MealCard meal={meal} index={index} />
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
