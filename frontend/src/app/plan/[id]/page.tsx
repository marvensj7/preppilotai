import Link from "next/link";
import { notFound } from "next/navigation";
import MealCard from "@/components/MealCard";
import MacroBadge from "@/components/MacroBadge";
import { fetchPlan } from "@/lib/api";
import type { PlanResponse } from "@/types/meal-plan";

interface PlanPageProps {
  params: { id: string };
}

export default async function PlanPage({ params }: PlanPageProps) {
  let data: PlanResponse;

  try {
    data = await fetchPlan(params.id);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("404") || msg.toLowerCase().includes("not found")) {
      notFound();
    }
    // For other errors render an inline error instead of crashing
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700"
        >
          <p className="font-semibold">Failed to load meal plan</p>
          <p className="mt-1 text-sm">{err instanceof Error ? err.message : "Unknown error"}</p>
        </div>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          ← Back to generator
        </Link>
      </main>
    );
  }

  const { plan, metadata } = data;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      {/* Back link */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        ← Generate a new plan
      </Link>

      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your Meal Plan</h1>
        <p className="mt-1 text-sm text-gray-500">Plan ID: {params.id}</p>
      </div>

      {/* Summary card */}
      <section className="mb-8 rounded-2xl bg-brand-600 p-5 text-white shadow-md">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider opacity-80">
          Daily Targets
        </h2>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-white/20 px-3 py-1 font-medium">
            {metadata.calories} kcal goal
          </span>
          <span className="rounded-full bg-white/20 px-3 py-1 font-medium">
            {metadata.protein_g}g protein goal
          </span>
          <span className="rounded-full bg-white/20 px-3 py-1 font-medium">
            ${metadata.budget_per_day_usd}/day budget
          </span>
          {metadata.dislikes.length > 0 && (
            <span className="rounded-full bg-white/20 px-3 py-1 font-medium">
              Avoiding: {metadata.dislikes.join(", ")}
            </span>
          )}
        </div>
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider opacity-80">
            Day Totals
          </p>
          <MacroBadge macros={plan.totals} size="sm" />
        </div>
      </section>

      {/* Meals */}
      <section className="mb-8 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Meals ({plan.meals.length})
        </h2>
        {plan.meals.map((meal, idx) => (
          <MealCard key={`${meal.name}-${idx}`} meal={meal} index={idx} />
        ))}
      </section>

      {/* Shopping list */}
      <section className="mb-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">Shopping List</h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {plan.shopping_list.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-gray-200 text-transparent">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Notes */}
      {plan.notes && (
        <section className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-700">
            Nutritionist Notes
          </h2>
          <p className="text-sm leading-relaxed text-gray-700">{plan.notes}</p>
        </section>
      )}
    </main>
  );
}
