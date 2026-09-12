"use client";

import { useState } from "react";

import { SaveBar } from "@/components/settings/SaveBar";
import { SelectField } from "@/components/ui/SelectField";
import {
  equipmentOptions,
  frequencyOptions,
  goalOptions,
  levelOptions,
  unitOptions,
} from "@/data/profile";

/** Training preferences that shape programming and recommendations. */
export function PreferencesSettings() {
  const [goal, setGoal] = useState("build-muscle");
  const [level, setLevel] = useState("intermediate");
  const [equipment, setEquipment] = useState("full-gym");
  const [frequency, setFrequency] = useState("5");
  const [units, setUnits] = useState("metric");

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
          value={frequency}
          onChange={setFrequency}
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

      <SaveBar label="Preferences updated" />
    </div>
  );
}
