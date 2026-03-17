import Link from "next/link";
import { notFound } from "next/navigation";
import MealCard from "@/components/MealCard";
import MacroBadge from "@/components/MacroBadge";
import ShoppingChecklist from "@/components/ShoppingChecklist";
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
    return (
      <main className="relative min-h-screen">
        <div className="relative z-10 mx-auto max-w-2xl px-4 py-12">
          <div
            className="rounded-2xl px-5 py-4 text-sm"
            role="alert"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#fca5a5",
            }}
          >
            <p className="font-semibold">Failed to load meal plan</p>
            <p className="mt-1 opacity-80">{err instanceof Error ? err.message : "Unknown error"}</p>
          </div>
          <Link href="/" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">
            ← Back to generator
          </Link>
        </div>
      </main>
    );
  }

  const { plan, metadata } = data;

  const totalMacroItems = [
    { label: "kcal", value: plan.totals.kcal, color: "#fb923c" },
    { label: "protein", value: plan.totals.protein, unit: "g", color: "#60a5fa" },
    { label: "carbs", value: plan.totals.carbs, unit: "g", color: "#facc15" },
    { label: "fat", value: plan.totals.fat, unit: "g", color: "#f472b6" },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Glow orbs */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            width: "500px",
            height: "500px",
            top: "-100px",
            right: "-200px",
            background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "400px",
            height: "400px",
            bottom: "0",
            left: "-100px",
            background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-10 sm:py-14">
        {/* Back link */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-300"
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            ←
          </span>
          Generate a new plan
        </Link>

        {/* Page title */}
        <div className="mb-8">
          <h1
            className="text-4xl font-black tracking-tight"
            style={{
              background: "linear-gradient(135deg, #22c55e 0%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Your Meal Plan
          </h1>
          <p className="mt-1 text-xs text-slate-600 font-mono">ID: {params.id}</p>
        </div>

        {/* Summary card */}
        <section
          className="mb-8 rounded-2xl p-5 sm:p-6"
          style={{
            background: "linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(6,182,212,0.08) 100%)",
            border: "1px solid rgba(34,197,94,0.2)",
          }}
        >
          {/* Preferences row */}
          <div className="mb-5 flex flex-wrap gap-2">
            {[
              { icon: "🔥", label: `${metadata.calories} kcal goal` },
              { icon: "💪", label: `${metadata.protein_g}g protein` },
              { icon: "💰", label: `$${metadata.budget_per_day_usd}/day` },
              ...(metadata.dislikes.length > 0
                ? [{ icon: "🚫", label: `No ${metadata.dislikes.join(", ")}` }]
                : []),
            ].map(({ icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium text-slate-300"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <span>{icon}</span>
                {label}
              </span>
            ))}
          </div>

          {/* Day totals */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Day Totals
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {totalMacroItems.map(({ label, value, unit, color }) => (
                <div
                  key={label}
                  className="rounded-xl px-3 py-2 text-center"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <p className="text-lg font-bold" style={{ color }}>
                    {value}<span className="text-sm">{unit ?? ""}</span>
                  </p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Meals */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <span>Meals</span>
            <span
              className="rounded-full px-2.5 py-0.5 text-sm font-semibold"
              style={{
                background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(6,182,212,0.2))",
                border: "1px solid rgba(34,197,94,0.3)",
                color: "#4ade80",
              }}
            >
              {plan.meals.length}
            </span>
          </h2>
          <div className="space-y-4">
            {plan.meals.map((meal, idx) => (
              <MealCard key={`${meal.name}-${idx}`} meal={meal} index={idx} />
            ))}
          </div>
        </section>

        {/* Shopping list */}
        <section
          className="mb-8 rounded-2xl p-5 sm:p-6"
          style={{
            background: "rgba(15,12,41,0.6)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <span>🛒</span>
            <span>Shopping List</span>
          </h2>
          <ShoppingChecklist items={plan.shopping_list} />
        </section>

        {/* Notes */}
        {plan.notes && (
          <section
            className="rounded-2xl p-5"
            style={{
              background: "linear-gradient(135deg, rgba(34,197,94,0.07) 0%, rgba(6,182,212,0.05) 100%)",
              border: "1px solid rgba(34,197,94,0.15)",
            }}
          >
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-slate-500">
              <span>💡</span> Nutritionist Notes
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">{plan.notes}</p>
          </section>
        )}
      </div>
    </main>
  );
}
