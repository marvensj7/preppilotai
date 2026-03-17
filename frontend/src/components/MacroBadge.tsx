import type { Macros } from "@/types/meal-plan";

interface MacroBadgeProps {
  macros: Macros;
  size?: "sm" | "md";
}

const MACRO_STYLES = {
  kcal:    { bg: "rgba(251,146,60,0.15)",  border: "rgba(251,146,60,0.35)",  text: "#fb923c", label: "kcal",    unit: "" },
  protein: { bg: "rgba(96,165,250,0.15)",  border: "rgba(96,165,250,0.35)",  text: "#60a5fa", label: "protein", unit: "g" },
  carbs:   { bg: "rgba(250,204,21,0.15)",  border: "rgba(250,204,21,0.35)",  text: "#facc15", label: "carbs",   unit: "g" },
  fat:     { bg: "rgba(244,114,182,0.15)", border: "rgba(244,114,182,0.35)", text: "#f472b6", label: "fat",     unit: "g" },
};

export default function MacroBadge({ macros, size = "md" }: MacroBadgeProps) {
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const padding  = size === "sm" ? "px-2.5 py-0.5" : "px-3 py-1";

  const items = (
    ["kcal", "protein", "carbs", "fat"] as const
  ).map((key) => ({ value: macros[key], ...MACRO_STYLES[key] }));

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ label, value, unit, bg, border, text }) => (
        <span
          key={label}
          className={`${textSize} ${padding} rounded-full font-semibold`}
          style={{ background: bg, border: `1px solid ${border}`, color: text }}
        >
          {value}{unit} {label}
        </span>
      ))}
    </div>
  );
}
