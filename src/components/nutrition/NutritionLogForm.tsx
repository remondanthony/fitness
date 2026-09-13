"use client";

import { DailyLogForm } from "@/components/wellness/DailyLogForm";
import { saveNutritionAction } from "@/lib/actions/daily";
import type { LoggedMacros } from "@/data/nutrition";

/** Binds the day's macro totals to their Server Action. */
export function NutritionLogForm({ logged }: { logged: LoggedMacros }) {
  const text = (value: number | null) => (value === null ? "" : String(value));

  return (
    <DailyLogForm
      title="Log Today"
      description="Your running totals for the day. Save as often as you like — each save replaces the day's entry."
      fields={[
        { key: "calories", label: "Calories", unit: "kcal", placeholder: "2050", step: "1", max: 20000 },
        { key: "protein", label: "Protein", unit: "g", placeholder: "160", step: "1", max: 2000 },
        { key: "carbs", label: "Carbs", unit: "g", placeholder: "205", step: "1", max: 2000 },
        { key: "fat", label: "Fat", unit: "g", placeholder: "64", step: "1", max: 2000 },
      ]}
      initial={{
        calories: text(logged.calories),
        protein: text(logged.protein),
        carbs: text(logged.carbs),
        fat: text(logged.fat),
      }}
      onSave={(values) =>
        saveNutritionAction({
          calories: values.calories ?? "",
          protein: values.protein ?? "",
          carbs: values.carbs ?? "",
          fat: values.fat ?? "",
        })
      }
    />
  );
}
