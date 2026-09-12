"use client";

import { useState } from "react";

import { SaveBar } from "@/components/settings/SaveBar";
import { SelectField } from "@/components/ui/SelectField";
import { updatePreferencesAction } from "@/lib/actions/account";
import {
  equipmentOptions,
  frequencyOptions,
  goalOptions,
  levelOptions,
  unitOptions,
} from "@/data/profile";

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
 */
export function PreferencesSettings({ initial }: { initial: PreferenceValues }) {
  const [goal, setGoal] = useState(initial.goal);
  const [level, setLevel] = useState(initial.level);
  const [equipment, setEquipment] = useState(initial.equipment);
  const [trainingDays, setTrainingDays] = useState(initial.trainingDays);
  const [units, setUnits] = useState(initial.units);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Current Goal"
          value={goal}
          onChange={setGoal}
          options={goalOptions}
          hint="Used to pick programs and set your calorie target."
        />
        <SelectField
          label="Training Level"
          value={level}
          onChange={setLevel}
          options={levelOptions}
          hint="Sets the starting difficulty of new blocks."
        />
        <SelectField
          label="Preferred Equipment"
          value={equipment}
          onChange={setEquipment}
          options={equipmentOptions}
          hint="Filters the programs you are shown."
        />
        <SelectField
          label="Weekly Training Frequency"
          value={trainingDays}
          onChange={setTrainingDays}
          options={frequencyOptions}
          hint="How many sessions a week the plan schedules."
        />
        <SelectField
          label="Units"
          value={units}
          onChange={setUnits}
          options={unitOptions}
          className="sm:col-span-2"
        />
      </div>

      <SaveBar
        hint="Saved to your account."
        onSave={() =>
          updatePreferencesAction({ goal, level, equipment, trainingDays, units })
        }
      />
    </div>
  );
}
