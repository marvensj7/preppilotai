import type { Macros } from "@/types/meal-plan";

interface MacroBadgeProps {
  macros: Macros;
  size?: "sm" | "md";
}

export default function MacroBadge({ macros }: MacroBadgeProps) {
  const items = [
    { label: "KCAL",    value: macros.kcal,    unit: "" },
    { label: "PROTEIN", value: macros.protein, unit: "G" },
    { label: "CARBS",   value: macros.carbs,   unit: "G" },
    { label: "FAT",     value: macros.fat,     unit: "G" },
  ];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {items.map(({ label, value, unit }) => (
        <span
          key={label}
          style={{
            background: "#1e1e1e",
            border: "1px solid #2a2a2a",
            borderRadius: 4,
            padding: "4px 8px",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: "#f5f5f5",
            whiteSpace: "nowrap",
          }}
        >
          {value}{unit} {label}
        </span>
      ))}
    </div>
  );
}
