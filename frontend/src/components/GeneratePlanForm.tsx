"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import HybridInput from "./HybridInput";
import TabToggle from "./TabToggle";
import GoalSelector from "./GoalSelector";
import MealCountSelector from "./MealCountSelector";
import MacroSummaryBar from "./MacroSummaryBar";
import TagInput from "./TagInput";
import LoadingSpinner from "./LoadingSpinner";
import { generatePlan } from "@/lib/api";
import type { GenerateFormValues, Goal } from "@/types/meal-plan";

// ---------------------------------------------------------------------------
// State shapes
// ---------------------------------------------------------------------------

interface SimpleValues {
  calories: number;
  protein_g: number;
  budget_per_day_usd: number;
  dislikes: string[];
}

interface AdvancedValues {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  meals_per_day: number;
  budget_per_day_usd: number;
  dislikes: string[];
  goal: Goal | null;
}

// ---------------------------------------------------------------------------
// Goal macro calculator (180 lb baseline)
// ---------------------------------------------------------------------------

function calculateGoalMacros(goal: Goal, baseCalories: number): Partial<AdvancedValues> {
  const WEIGHT = 180;
  let calories = baseCalories;
  let protein_g: number;
  let fat_g: number;

  if (goal === "cut") {
    calories = Math.round(baseCalories * 0.8);
    protein_g = Math.round(WEIGHT * 1.2);
    fat_g = Math.round(WEIGHT * 0.35);
  } else if (goal === "bulk") {
    calories = Math.round(baseCalories * 1.15);
    protein_g = Math.round(WEIGHT * 1.0);
    fat_g = Math.round(WEIGHT * 0.4);
  } else {
    protein_g = Math.round(WEIGHT * 1.0);
    fat_g = Math.round(WEIGHT * 0.4);
  }

  protein_g = Math.min(500, Math.max(0, protein_g));
  fat_g = Math.min(200, Math.max(0, fat_g));
  calories = Math.min(5000, Math.max(500, calories));

  const carbs_g = Math.min(600, Math.max(0, Math.round((calories - protein_g * 4 - fat_g * 9) / 4)));

  return { calories, protein_g, fat_g, carbs_g };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GeneratePlanForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"simple" | "advanced">("simple");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [simple, setSimple] = useState<SimpleValues>({
    calories: 2000,
    protein_g: 150,
    budget_per_day_usd: 15,
    dislikes: [],
  });

  const [advanced, setAdvanced] = useState<AdvancedValues>({
    calories: 2000,
    protein_g: 180,
    carbs_g: 158,
    fat_g: 72,
    meals_per_day: 3,
    budget_per_day_usd: 15,
    dislikes: [],
    goal: null,
  });

  function setSimpleField<K extends keyof SimpleValues>(key: K, value: SimpleValues[K]) {
    setSimple((prev) => ({ ...prev, [key]: value }));
  }

  function setAdvancedField<K extends keyof AdvancedValues>(key: K, value: AdvancedValues[K]) {
    setAdvanced((prev) => ({ ...prev, [key]: value }));
  }

  function handleGoalSelect(goal: Goal) {
    const macros = calculateGoalMacros(goal, advanced.calories);
    setAdvanced((prev) => ({ ...prev, goal, ...macros }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const values: GenerateFormValues =
      activeTab === "simple"
        ? {
            calories: simple.calories,
            protein_g: simple.protein_g,
            budget_per_day_usd: simple.budget_per_day_usd,
            dislikes: simple.dislikes,
          }
        : {
            calories: advanced.calories,
            protein_g: advanced.protein_g,
            carbs_g: advanced.carbs_g,
            fat_g: advanced.fat_g,
            meals_per_day: advanced.meals_per_day,
            budget_per_day_usd: advanced.budget_per_day_usd,
            dislikes: advanced.dislikes,
            ...(advanced.goal ? { goal: advanced.goal } : {}),
          };

    try {
      const result = await generatePlan(values);
      router.push(`/plan/${result.plan_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <LoadingSpinner message="Generating your precision meal plan…" />;
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }} noValidate>
      {/* Tab toggle */}
      <TabToggle activeTab={activeTab} onChange={setActiveTab} />

      {/* Divider */}
      <div style={{ height: 1, background: "#1a1a1a" }} />

      {activeTab === "simple" ? (
        <>
          <HybridInput
            id="s-calories"
            label="Daily Calories"
            value={simple.calories}
            min={500} max={5000} step={50} unit=" kcal"
            onChange={(v) => setSimpleField("calories", v)}
          />
          <HybridInput
            id="s-protein"
            label="Daily Protein"
            value={simple.protein_g}
            min={0} max={500} step={5} unit="g"
            onChange={(v) => setSimpleField("protein_g", v)}
          />
          <HybridInput
            id="s-budget"
            label="Daily Budget"
            value={simple.budget_per_day_usd}
            min={1} max={100} step={1}
            formatDisplay={(v) => `$${v}`}
            onChange={(v) => setSimpleField("budget_per_day_usd", v)}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p className="label">Foods to Avoid <span style={{ color: "#444", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— optional</span></p>
            <TagInput tags={simple.dislikes} onChange={(t) => setSimpleField("dislikes", t)} />
            <p style={{ fontSize: 11, color: "#444" }}>Enter + comma to add</p>
          </div>
        </>
      ) : (
        <>
          {/* Goal selector */}
          <GoalSelector value={advanced.goal} onChange={handleGoalSelect} />

          <div style={{ height: 1, background: "#1a1a1a" }} />

          <HybridInput
            id="a-calories"
            label="Daily Calories"
            value={advanced.calories}
            min={500} max={5000} step={50} unit=" kcal"
            onChange={(v) => setAdvancedField("calories", v)}
          />
          <HybridInput
            id="a-protein"
            label="Protein"
            value={advanced.protein_g}
            min={0} max={500} step={5} unit="g"
            onChange={(v) => setAdvancedField("protein_g", v)}
          />
          <HybridInput
            id="a-carbs"
            label="Carbohydrates"
            value={advanced.carbs_g}
            min={0} max={600} step={5} unit="g"
            onChange={(v) => setAdvancedField("carbs_g", v)}
          />
          <HybridInput
            id="a-fats"
            label="Fats"
            value={advanced.fat_g}
            min={0} max={200} step={2} unit="g"
            onChange={(v) => setAdvancedField("fat_g", v)}
          />

          {/* Live macro summary bar */}
          <MacroSummaryBar
            protein_g={advanced.protein_g}
            carbs_g={advanced.carbs_g}
            fat_g={advanced.fat_g}
            targetCalories={advanced.calories}
          />

          <div style={{ height: 1, background: "#1a1a1a" }} />

          <MealCountSelector
            value={advanced.meals_per_day}
            onChange={(v) => setAdvancedField("meals_per_day", v)}
          />

          <HybridInput
            id="a-budget"
            label="Daily Budget"
            value={advanced.budget_per_day_usd}
            min={1} max={100} step={1}
            formatDisplay={(v) => `$${v}`}
            onChange={(v) => setAdvancedField("budget_per_day_usd", v)}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p className="label">Foods to Avoid <span style={{ color: "#444", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— optional</span></p>
            <TagInput tags={advanced.dislikes} onChange={(t) => setAdvancedField("dislikes", t)} />
            <p style={{ fontSize: 11, color: "#444" }}>Enter or comma to add</p>
          </div>
        </>
      )}

      {error && (
        <div
          role="alert"
          style={{
            background: "#1a0a0a",
            border: "1px solid #3a1a1a",
            borderRadius: 6,
            padding: "10px 14px",
            fontSize: 13,
            color: "#cc6666",
          }}
        >
          {error}
        </div>
      )}

      <button type="submit" className="btn-primary">
        GENERATE MEAL PLAN →
      </button>
    </form>
  );
}
