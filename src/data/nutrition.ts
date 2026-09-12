import {
  Beef,
  Croissant,
  Droplets,
  Flame,
  Sunrise,
  Sun,
  Apple,
  Moon,
  type LucideIcon,
} from "lucide-react";

import type { ImagePlaceholderVariant } from "@/components/ui/ImagePlaceholder";

export type MacroTarget = {
  id: string;
  label: string;
  /** Daily target. */
  value: number;
  unit: string;
  /** Logged so far today. */
  consumed: number;
  icon: LucideIcon;
  caption: string;
};

export const macroTargets: MacroTarget[] = [
  {
    id: "calories",
    label: "Daily Calories",
    value: 2050,
    unit: "kcal",
    consumed: 1410,
    icon: Flame,
    caption: "Maintenance plus a small surplus",
  },
  {
    id: "protein",
    label: "Protein",
    value: 160,
    unit: "g",
    consumed: 118,
    icon: Beef,
    caption: "Roughly 2.1 g per kg of bodyweight",
  },
  {
    id: "carbs",
    label: "Carbs",
    value: 205,
    unit: "g",
    consumed: 160,
    icon: Croissant,
    caption: "Weighted toward training days",
  },
  {
    id: "fat",
    label: "Fat",
    value: 64,
    unit: "g",
    consumed: 32,
    icon: Droplets,
    caption: "About 28% of your daily calories",
  },
];

export type Macros = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type Ingredient = {
  name: string;
  quantity: string;
  category: "Produce" | "Protein" | "Dairy" | "Pantry";
};

export type Meal = {
  id: string;
  slot: string;
  time: string;
  title: string;
  summary: string;
  icon: LucideIcon;
  artwork: ImagePlaceholderVariant;
  macros: Macros;
  ingredients: Ingredient[];
};

/** Today's plan. The four meals add up exactly to the daily targets above. */
export const todaysMeals: Meal[] = [
  {
    id: "breakfast",
    slot: "Breakfast",
    time: "7:30 AM",
    title: "Greek Yogurt + Berries + Oats",
    summary: "Thick yogurt, rolled oats and frozen berries, stirred the night before.",
    icon: Sunrise,
    artwork: "meal",
    macros: { calories: 480, protein: 34, carbs: 62, fat: 11 },
    ingredients: [
      { name: "Greek yogurt", quantity: "400 g", category: "Dairy" },
      { name: "Rolled oats", quantity: "60 g", category: "Pantry" },
      { name: "Mixed berries", quantity: "150 g", category: "Produce" },
      { name: "Honey", quantity: "1 tbsp", category: "Pantry" },
    ],
  },
  {
    id: "lunch",
    slot: "Lunch",
    time: "12:45 PM",
    title: "Grilled Chicken Rice Bowl",
    summary: "Chicken thigh, jasmine rice, cucumber and a spoon of chilli sauce.",
    icon: Sun,
    artwork: "meal",
    macros: { calories: 620, protein: 52, carbs: 68, fat: 14 },
    ingredients: [
      { name: "Chicken thigh", quantity: "200 g", category: "Protein" },
      { name: "Jasmine rice", quantity: "80 g dry", category: "Pantry" },
      { name: "Cucumber", quantity: "1", category: "Produce" },
      { name: "Spring onion", quantity: "2 stalks", category: "Produce" },
      { name: "Chilli sauce", quantity: "2 tbsp", category: "Pantry" },
    ],
  },
  {
    id: "snack",
    slot: "Snack",
    time: "4:00 PM",
    title: "Protein Smoothie",
    summary: "Banana, milk, whey and a spoon of peanut butter. Sixty seconds.",
    icon: Apple,
    artwork: "meal",
    macros: { calories: 310, protein: 32, carbs: 30, fat: 7 },
    ingredients: [
      { name: "Banana", quantity: "1", category: "Produce" },
      { name: "Semi-skimmed milk", quantity: "300 ml", category: "Dairy" },
      { name: "Whey protein", quantity: "1 scoop", category: "Pantry" },
      { name: "Peanut butter", quantity: "1 tsp", category: "Pantry" },
    ],
  },
  {
    id: "dinner",
    slot: "Dinner",
    time: "7:30 PM",
    title: "Steak + Potatoes + Vegetables",
    summary: "Sirloin, roast new potatoes and whatever green vegetable is in the fridge.",
    icon: Moon,
    artwork: "meal",
    macros: { calories: 640, protein: 42, carbs: 45, fat: 32 },
    ingredients: [
      { name: "Sirloin steak", quantity: "200 g", category: "Protein" },
      { name: "New potatoes", quantity: "250 g", category: "Produce" },
      { name: "Tenderstem broccoli", quantity: "150 g", category: "Produce" },
      { name: "Olive oil", quantity: "1 tbsp", category: "Pantry" },
      { name: "Butter", quantity: "10 g", category: "Dairy" },
    ],
  },
];

export function sumMacros(meals: Meal[]): Macros {
  return meals.reduce<Macros>(
    (total, meal) => ({
      calories: total.calories + meal.macros.calories,
      protein: total.protein + meal.macros.protein,
      carbs: total.carbs + meal.macros.carbs,
      fat: total.fat + meal.macros.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

/** Shopping-list order, so the list reads like a supermarket route. */
export const ingredientCategories = ["Produce", "Protein", "Dairy", "Pantry"] as const;

// ---------------------------------------------------------------------------
// Calorie estimator
// ---------------------------------------------------------------------------

export type ActivityLevel = {
  value: string;
  label: string;
  description: string;
  multiplier: number;
};

export const activityLevels: ActivityLevel[] = [
  {
    value: "sedentary",
    label: "Sedentary",
    description: "Desk job, little planned activity",
    multiplier: 1.2,
  },
  {
    value: "light",
    label: "Lightly Active",
    description: "Training 1–2 days a week",
    multiplier: 1.375,
  },
  {
    value: "moderate",
    label: "Moderately Active",
    description: "Training 3–4 days a week",
    multiplier: 1.55,
  },
  {
    value: "very",
    label: "Very Active",
    description: "Training 5–6 days a week",
    multiplier: 1.725,
  },
  {
    value: "athlete",
    label: "Athlete",
    description: "Twice a day, or a physical job",
    multiplier: 1.9,
  },
];

export type CalorieGoal = {
  value: string;
  label: string;
  description: string;
  /** Applied to maintenance calories. */
  adjustment: number;
  /** Grams of protein per kg of bodyweight. */
  proteinPerKg: number;
  /** Share of calories from fat. */
  fatShare: number;
};

export const calorieGoals: CalorieGoal[] = [
  {
    value: "lose",
    label: "Lose Fat",
    description: "A moderate deficit you can hold",
    adjustment: -0.2,
    proteinPerKg: 2.2,
    fatShare: 0.25,
  },
  {
    value: "maintain",
    label: "Maintain",
    description: "Hold your weight where it is",
    adjustment: 0,
    proteinPerKg: 1.8,
    fatShare: 0.28,
  },
  {
    value: "build",
    label: "Build Muscle",
    description: "A small surplus to grow on",
    adjustment: 0.12,
    proteinPerKg: 2,
    fatShare: 0.25,
  },
];

export type CalorieEstimate = {
  bmr: number;
  maintenance: number;
  target: number;
  protein: number;
  carbs: number;
  fat: number;
};

/**
 * Mifflin-St Jeor, using the midpoint of the male (+5) and female (-161)
 * constants because the form deliberately does not ask for sex. Every result is
 * an estimate and is labelled as one in the UI.
 */
export function estimateCalories(input: {
  age: number;
  heightCm: number;
  weightKg: number;
  activity: string;
  goal: string;
}): CalorieEstimate {
  const activity =
    activityLevels.find((level) => level.value === input.activity) ?? activityLevels[2];
  const goal = calorieGoals.find((entry) => entry.value === input.goal) ?? calorieGoals[1];

  const bmr =
    10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age - 78;
  const maintenance = bmr * activity.multiplier;
  const target = maintenance * (1 + goal.adjustment);

  const protein = input.weightKg * goal.proteinPerKg;
  const fat = (target * goal.fatShare) / 9;
  const carbs = Math.max(0, (target - protein * 4 - fat * 9) / 4);

  return {
    bmr: Math.round(bmr),
    maintenance: Math.round(maintenance),
    target: Math.round(target),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
  };
}
