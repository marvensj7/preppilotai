import type { Meal } from "@/types/meal-plan";
import MacroBadge from "./MacroBadge";

interface MealCardProps {
  meal: Meal;
  index: number;
}

export default function MealCard({ meal, index }: MealCardProps) {
  return (
    <article className="card" style={{ overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid #1e1e1e",
          display: "flex",
          alignItems: "baseline",
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "#444",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#f5f5f5",
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {meal.name}
        </h3>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        <MacroBadge macros={meal.macros} />

        <div>
          <p className="label" style={{ marginBottom: 8 }}>Ingredients</p>
          <ul style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", margin: 0, padding: 0, listStyle: "none" }}>
            {meal.ingredients.map((ingredient) => (
              <li
                key={ingredient}
                style={{ fontSize: 13, color: "#888", display: "flex", alignItems: "flex-start", gap: 6 }}
              >
                <span style={{ color: "#333", marginTop: 4, flexShrink: 0 }}>—</span>
                {ingredient}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="label" style={{ marginBottom: 6 }}>Preparation</p>
          <p style={{ fontSize: 13, color: "#888", lineHeight: 1.6, margin: 0 }}>{meal.prep}</p>
        </div>
      </div>
    </article>
  );
}
