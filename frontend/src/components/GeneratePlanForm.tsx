"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import SliderField from "./SliderField";
import TagInput from "./TagInput";
import LoadingSpinner from "./LoadingSpinner";
import { generatePlan } from "@/lib/api";
import type { GenerateFormValues } from "@/types/meal-plan";

const DEFAULT_VALUES: GenerateFormValues = {
  calories: 2000,
  protein_g: 150,
  dislikes: [],
  budget_per_day_usd: 15,
};

export default function GeneratePlanForm() {
  const router = useRouter();
  const [values, setValues] = useState<GenerateFormValues>(DEFAULT_VALUES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof GenerateFormValues>(key: K, value: GenerateFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await generatePlan(values);
      router.push(`/plan/${result.plan_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <LoadingSpinner message="Cooking up your personalised meal plan with AI..." />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7" noValidate>
      <SliderField
        id="calories"
        label="Daily Calories"
        value={values.calories}
        min={500}
        max={5000}
        step={50}
        unit=" kcal"
        onChange={(v) => setField("calories", v)}
      />

      <SliderField
        id="protein"
        label="Daily Protein"
        value={values.protein_g}
        min={0}
        max={500}
        step={5}
        unit="g"
        onChange={(v) => setField("protein_g", v)}
      />

      <SliderField
        id="budget"
        label="Daily Food Budget"
        value={values.budget_per_day_usd}
        min={1}
        max={100}
        step={1}
        formatValue={(v) => `$${v}`}
        onChange={(v) => setField("budget_per_day_usd", v)}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Foods to Avoid
          <span className="ml-1.5 text-xs font-normal text-gray-400">(optional)</span>
        </label>
        <TagInput
          tags={values.dislikes}
          onChange={(tags) => setField("dislikes", tags)}
          placeholder="e.g. gluten, shellfish, mushrooms…"
        />
        <p className="text-xs text-gray-400">Press Enter or comma to add each item.</p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        className="w-full rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 active:scale-[0.98]"
      >
        Generate My Meal Plan
      </button>
    </form>
  );
}
