export interface Macros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  name: string;
  ingredients: string[];
  macros: Macros;
  prep: string;
}

export interface MealPlan {
  meals: Meal[];
  totals: Macros;
  shopping_list: string[];
  notes: string;
}

export type Goal = "cut" | "maintain" | "bulk";

export interface PlanMetadata {
  calories: number;
  protein_g: number;
  dislikes: string[];
  budget_per_day_usd: number;
  carbs_g?: number;
  fat_g?: number;
  meals_per_day?: number;
  goal?: Goal;
}

export interface GenerateResponse {
  plan_id: string;
  plan: MealPlan;
  metadata: PlanMetadata;
}

export interface PlanResponse {
  plan_id: string;
  plan: MealPlan;
  metadata: PlanMetadata;
}

export interface GenerateFormValues {
  calories: number;
  protein_g: number;
  dislikes: string[];
  budget_per_day_usd: number;
  carbs_g?: number;
  fat_g?: number;
  meals_per_day?: number;
  goal?: Goal;
}
