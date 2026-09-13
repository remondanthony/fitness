"use client";

import { DailyLogForm } from "@/components/wellness/DailyLogForm";
import { saveWellnessAction } from "@/lib/actions/daily";
import { wellnessGoals, type DailyReadings } from "@/data/wellness";

/**
 * Binds the day's wellness figures to their Server Action.
 *
 * The closure over the action lives here rather than on the page, because a
 * function cannot be handed from a Server Component to a Client one.
 */
export function WellnessLogForm({ readings }: { readings: DailyReadings }) {
  const text = (value: number | null) => (value === null ? "" : String(value));

  return (
    <DailyLogForm
      title="Log Today"
      description="Your own figures for the day. Save as often as you like — each save replaces the day's entry."
      fields={[
        {
          key: "sleepHours",
          label: "Sleep",
          unit: "hrs",
          placeholder: String(wellnessGoals.sleepHours),
          step: "0.1",
          max: 24,
        },
        {
          key: "waterLiters",
          label: "Water",
          unit: "L",
          placeholder: String(wellnessGoals.waterLiters),
          step: "0.1",
          max: 30,
        },
        {
          key: "steps",
          label: "Steps",
          unit: "steps",
          placeholder: String(wellnessGoals.steps),
          step: "1",
          max: 200000,
        },
        {
          key: "mindfulnessMinutes",
          label: "Mindfulness",
          unit: "min",
          placeholder: String(wellnessGoals.mindfulnessMinutes),
          step: "1",
          max: 1440,
        },
        {
          key: "recoveryScore",
          label: "Recovery",
          unit: "%",
          placeholder: "80",
          step: "1",
          max: 100,
        },
      ]}
      initial={{
        sleepHours: text(readings.sleepHours),
        waterLiters: text(readings.waterLiters),
        steps: text(readings.steps),
        mindfulnessMinutes: text(readings.mindfulnessMinutes),
        recoveryScore: text(readings.recoveryScore),
      }}
      onSave={(values) =>
        saveWellnessAction({
          sleepHours: values.sleepHours ?? "",
          waterLiters: values.waterLiters ?? "",
          steps: values.steps ?? "",
          mindfulnessMinutes: values.mindfulnessMinutes ?? "",
          recoveryScore: values.recoveryScore ?? "",
        })
      }
    />
  );
}
