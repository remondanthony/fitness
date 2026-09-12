"use client";

import { Calculator, Info } from "lucide-react";
import { useId, useMemo, useState } from "react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import {
  activityLevels,
  calorieGoals,
  estimateCalories,
} from "@/data/nutrition";

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (value: number) => void;
};

/** Range input styled for the dark system, with a filled accent track. */
function Slider({ label, value, min, max, step = 1, unit, onChange }: SliderProps) {
  const id = useId();
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="text-fog text-[10px] font-semibold tracking-[0.2em] uppercase"
        >
          {label}
        </label>
        <p className="flex items-baseline gap-1.5">
          <span className="font-display text-chalk text-2xl">{value}</span>
          <span className="text-fog text-[10px] font-semibold tracking-[0.16em] uppercase">
            {unit}
          </span>
        </p>
      </div>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{
          background: `linear-gradient(to right, #ff5a1f ${percent}%, rgba(255,255,255,0.1) ${percent}%)`,
        }}
        className={cn(
          "mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full ",
          "focus-visible:outline-accent-500 focus-visible:outline-2 focus-visible:outline-offset-2",
          "[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent",
          "[&::-webkit-slider-thumb]:-mt-[7px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white/80 [&::-webkit-slider-thumb]:bg-accent-500 [&::-webkit-slider-thumb]:shadow-glow [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-110",
          "[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent",
          "[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white/80 [&::-moz-range-thumb]:bg-accent-500",
        )}
      />
    </div>
  );
}

type ChoiceGroupProps = {
  legend: string;
  name: string;
  options: { value: string; label: string; description: string }[];
  value: string;
  onChange: (value: string) => void;
  columns?: string;
};

/** Radio group rendered as selectable cards. */
function ChoiceGroup({
  legend,
  name,
  options,
  value,
  onChange,
  columns = "sm:grid-cols-3",
}: ChoiceGroupProps) {
  return (
    <fieldset>
      <legend className="text-fog text-[10px] font-semibold tracking-[0.2em] uppercase">
        {legend}
      </legend>
      <div className={cn("mt-4 grid gap-2", columns)}>
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                "cursor-pointer rounded-xl border p-3.5 transition-all duration-200 select-none",
                "has-[:focus-visible]:outline-accent-500 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2",
                checked
                  ? "border-accent-500 bg-accent-500/12"
                  : "border-chalk/10 bg-chalk/[0.03] hover:border-chalk/25",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span
                className={cn(
                  "block text-sm font-semibold",
                  checked ? "text-accent-400" : "text-chalk",
                )}
              >
                {option.label}
              </span>
              <span className="text-fog mt-1 block text-xs leading-relaxed">
                {option.description}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Interactive daily calorie estimator. Everything is client-side. */
export function CalorieCalculator() {
  const [age, setAge] = useState(29);
  const [heightCm, setHeightCm] = useState(178);
  const [weightKg, setWeightKg] = useState(74);
  const [activity, setActivity] = useState("moderate");
  const [goal, setGoal] = useState("build");

  const estimate = useMemo(
    () => estimateCalories({ age, heightCm, weightKg, activity, goal }),
    [age, heightCm, weightKg, activity, goal],
  );

  const macros = [
    { label: "Protein", value: estimate.protein },
    { label: "Carbs", value: estimate.carbs },
    { label: "Fat", value: estimate.fat },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      {/* Inputs */}
      <Card tone="raised" className="lg:col-span-7">
        <h3 className="font-display text-chalk flex items-center gap-3 text-2xl">
          <Calculator className="text-accent-500 h-5 w-5" aria-hidden="true" />
          Calorie Calculator
        </h3>

        <div className="mt-8 grid gap-7 sm:grid-cols-3">
          <Slider label="Age" value={age} min={16} max={80} unit="yrs" onChange={setAge} />
          <Slider
            label="Height"
            value={heightCm}
            min={140}
            max={210}
            unit="cm"
            onChange={setHeightCm}
          />
          <Slider
            label="Weight"
            value={weightKg}
            min={40}
            max={160}
            unit="kg"
            onChange={setWeightKg}
          />
        </div>

        <div className="mt-9">
          <ChoiceGroup
            legend="Activity Level"
            name="activity"
            options={activityLevels}
            value={activity}
            onChange={setActivity}
            columns="sm:grid-cols-2 lg:grid-cols-3"
          />
        </div>

        <div className="mt-9">
          <ChoiceGroup
            legend="Goal"
            name="goal"
            options={calorieGoals}
            value={goal}
            onChange={setGoal}
          />
        </div>
      </Card>

      {/* Result */}
      <Card tone="glass" className="flex flex-col lg:col-span-5">
        <p className="text-fog text-[10px] font-semibold tracking-[0.24em] uppercase">
          Estimated Daily Target
        </p>

        <p className="mt-6 flex items-baseline gap-3">
          <span className="font-display text-chalk text-6xl tabular-nums sm:text-7xl">
            {formatNumber(estimate.target)}
          </span>
          <span className="text-accent-400 text-sm font-semibold tracking-[0.16em] uppercase">
            kcal
          </span>
        </p>

        <dl className="divide-chalk/8 border-chalk/8 mt-8 grid grid-cols-3 divide-x rounded-2xl border">
          {macros.map((macro) => (
            <div key={macro.label} className="px-3 py-5 text-center">
              <dd className="font-display text-chalk text-2xl">{macro.value}g</dd>
              <dt className="text-fog mt-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
                {macro.label}
              </dt>
            </div>
          ))}
        </dl>

        <dl className="mt-7 flex flex-col gap-3">
          {[
            { label: "Resting burn (BMR)", value: `${formatNumber(estimate.bmr)} kcal` },
            {
              label: "Maintenance",
              value: `${formatNumber(estimate.maintenance)} kcal`,
            },
          ].map((row) => (
            <div
              key={row.label}
              className="border-chalk/8 flex items-baseline justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
            >
              <dt className="text-fog text-xs">{row.label}</dt>
              <dd className="text-chalk text-sm font-semibold tabular-nums">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="text-fog mt-auto flex items-start gap-2.5 pt-8 text-xs leading-relaxed">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>
            These numbers are <strong className="text-mist font-semibold">estimates</strong>{" "}
            from a standard formula, not measurements. Use them as a starting point, track
            how you respond over two weeks, and adjust. Not medical or dietary advice.
          </span>
        </p>
      </Card>
    </div>
  );
}
