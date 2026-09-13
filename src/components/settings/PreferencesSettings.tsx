"use client";

import { ArrowRight, Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { SaveBar } from "@/components/settings/SaveBar";
import { SelectField } from "@/components/ui/SelectField";
import { updatePreferencesAction } from "@/lib/actions/account";
import {
  equipmentOptions,
  goalOptions,
  levelOptions,
  trainingDayOptions,
  unitOptions,
} from "@/lib/personalization";

export type PreferenceValues = {
  goal: string;
  level: string;
  equipment: string;
  trainingDays: string;
  units: string;
};

/**
 * Training preferences. The values live across three tables — the goal in
 * user_goals, experience level on the profile, and the rest in
 * user_preferences — which the save action writes together.
 *
 * Settings edits personalization; onboarding establishes it. An unanswered
 * question shows as "Not set" rather than a plausible default, and saving is
 * held back until onboarding is done — otherwise pressing Save would turn
 * whatever the selects happened to display into real answers. The server
 * enforces the same rule, so this is the courtesy, not the safeguard.
 */
export function PreferencesSettings({
  initial,
  complete,
}: {
  initial: PreferenceValues;
  /** Whether every required personalization answer is already on record. */
  complete: boolean;
}) {
  const [goal, setGoal] = useState(initial.goal);
  const [level, setLevel] = useState(initial.level);
  const [equipment, setEquipment] = useState(initial.equipment);
  const [trainingDays, setTrainingDays] = useState(initial.trainingDays);
  const [units, setUnits] = useState(initial.units);

  const placeholder = complete ? undefined : "Not set";

  return (
    <div className="flex flex-col gap-6">
      {!complete ? (
        <div className="border-accent-500/25 bg-accent-500/[0.07] flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <Info
              className="text-accent-400 mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-chalk text-sm font-semibold">
                Finish setting up your training
              </p>
              <p className="text-fog mt-1.5 text-xs leading-relaxed">
                Anything marked &quot;Not set&quot; hasn&apos;t been answered yet. Set up
                takes about a minute, and these settings are yours to edit afterwards.
              </p>
            </div>
          </div>

          <Link
            href="/onboarding"
            className="border-chalk/15 bg-chalk/5 text-chalk hover:border-chalk/30 hover:bg-chalk/10 focus-visible:outline-accent-500 press inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Set Up Training
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Current Goal"
          value={goal}
          onChange={setGoal}
          options={goalOptions}
          placeholder={placeholder}
          disabled={!complete}
          hint="Used to pick programs and set your calorie target."
        />
        <SelectField
          label="Training Level"
          value={level}
          onChange={setLevel}
          options={levelOptions}
          placeholder={placeholder}
          disabled={!complete}
          hint="Sets the starting difficulty of new blocks."
        />
        <SelectField
          label="Preferred Equipment"
          value={equipment}
          onChange={setEquipment}
          options={equipmentOptions}
          placeholder={placeholder}
          disabled={!complete}
          hint="Filters the programs you are shown."
        />
        <SelectField
          label="Weekly Training Frequency"
          value={trainingDays}
          onChange={setTrainingDays}
          options={trainingDayOptions}
          placeholder={placeholder}
          disabled={!complete}
          hint="How many sessions a week the plan schedules."
        />
        <SelectField
          label="Units"
          value={units}
          onChange={setUnits}
          options={unitOptions}
          placeholder={placeholder}
          disabled={!complete}
          className="sm:col-span-2"
        />
      </div>

      <SaveBar
        disabled={!complete}
        hint={
          complete
            ? "Saved to your account."
            : "Complete set up to edit these."
        }
        onSave={() =>
          updatePreferencesAction({ goal, level, equipment, trainingDays, units })
        }
      />
    </div>
  );
}
