import Link from "next/link";
import { notFound } from "next/navigation";
import MealCard from "@/components/MealCard";
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
      <main style={{ minHeight: "100vh", padding: "48px 16px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div
            role="alert"
            style={{
              background: "#1a0a0a",
              border: "1px solid #3a1a1a",
              borderRadius: 8,
              padding: "16px 20px",
              fontSize: 13,
              color: "#cc6666",
            }}
          >
            <p style={{ fontWeight: 700, margin: "0 0 4px" }}>Failed to load plan</p>
            <p style={{ margin: 0, color: "#885555" }}>
              {err instanceof Error ? err.message : "Unknown error"}
            </p>
          </div>
          <Link
            href="/"
            style={{ display: "inline-block", marginTop: 20, fontSize: 13, color: "#888", textDecoration: "none" }}
          >
            ← Back
          </Link>
        </div>
      </main>
    );
  }

  const { plan, metadata } = data;

  const goalLabel: Record<string, string> = {
    cut: "CUT",
    maintain: "MAINTAIN",
    bulk: "BULK",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "48px 16px 80px",
      }}
    >
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {/* Back */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "#555",
            textDecoration: "none",
            marginBottom: 32,
            textTransform: "uppercase",
          }}
        >
          ← GENERATOR
        </Link>

        {/* Title */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "-0.01em",
              color: "#f5f5f5",
              margin: "0 0 4px",
              textTransform: "uppercase",
            }}
          >
            Your Meal Plan
          </h1>
          <p style={{ fontSize: 11, color: "#444", margin: 0, fontFamily: "monospace" }}>
            {params.id}
          </p>
        </div>

        {/* Summary card */}
        <div className="card" style={{ padding: "16px 20px", marginBottom: 24 }}>
          {/* Targets row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {metadata.goal && (
              <span
                style={{
                  background: "#f5f5f5",
                  color: "#0a0a0a",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  borderRadius: 4,
                  padding: "4px 8px",
                }}
              >
                {goalLabel[metadata.goal] ?? metadata.goal.toUpperCase()}
              </span>
            )}
            {[
              `${metadata.calories} KCAL`,
              `${metadata.protein_g}G PROTEIN`,
              ...(metadata.carbs_g != null ? [`${metadata.carbs_g}G CARBS`] : []),
              ...(metadata.fat_g != null ? [`${metadata.fat_g}G FAT`] : []),
              `$${metadata.budget_per_day_usd}/DAY`,
              ...(metadata.dislikes?.length ? [`NO ${metadata.dislikes.join(", ").toUpperCase()}`] : []),
            ].map((label) => (
              <span
                key={label}
                style={{
                  background: "#1e1e1e",
                  border: "1px solid #2a2a2a",
                  color: "#888",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  borderRadius: 4,
                  padding: "4px 8px",
                }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Day totals */}
          <div>
            <p className="label" style={{ marginBottom: 10 }}>Day Totals</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
              {[
                { label: "KCAL",    value: plan.totals.kcal,    unit: "" },
                { label: "PROTEIN", value: plan.totals.protein, unit: "G" },
                { label: "CARBS",   value: plan.totals.carbs,   unit: "G" },
                { label: "FAT",     value: plan.totals.fat,     unit: "G" },
              ].map(({ label, value, unit }) => (
                <div
                  key={label}
                  style={{
                    background: "#0a0a0a",
                    border: "1px solid #1e1e1e",
                    borderRadius: 6,
                    padding: "10px 8px",
                    textAlign: "center",
                  }}
                >
                  <p style={{ fontSize: 20, fontWeight: 700, color: "#f5f5f5", margin: 0, lineHeight: 1 }}>
                    {value}<span style={{ fontSize: 13 }}>{unit}</span>
                  </p>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#555", margin: "4px 0 0", textTransform: "uppercase" }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Meals */}
        <section style={{ marginBottom: 24 }}>
          <p className="label" style={{ marginBottom: 12 }}>
            Meals — {plan.meals.length}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {plan.meals.map((meal, idx) => (
              <MealCard key={`${meal.name}-${idx}`} meal={meal} index={idx} />
            ))}
          </div>
        </section>

        {/* Shopping list */}
        <section className="card" style={{ padding: "16px 20px", marginBottom: 16 }}>
          <p className="label" style={{ marginBottom: 16 }}>Shopping List</p>
          <ShoppingChecklist items={plan.shopping_list} />
        </section>

        {/* Notes */}
        {plan.notes && (
          <section
            style={{
              background: "#1a1a1a",
              border: "1px solid #1e1e1e",
              borderRadius: 8,
              padding: "16px 20px",
              marginBottom: 32,
            }}
          >
            <p className="label" style={{ marginBottom: 8 }}>Performance Notes</p>
            <p style={{ fontSize: 13, color: "#888", lineHeight: 1.7, margin: 0 }}>{plan.notes}</p>
          </section>
        )}

        {/* CTA */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <button className="btn-primary" type="button">
            GENERATE ANOTHER PLAN →
          </button>
        </Link>
      </div>
    </main>
  );
}
