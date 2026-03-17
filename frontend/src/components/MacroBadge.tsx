import type { Macros } from "@/types/meal-plan";

interface MacroBadgeProps {
  macros: Macros;
  size?: "sm" | "md";
}

export default function MacroBadge({ macros, size = "md" }: MacroBadgeProps) {
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const padding = size === "sm" ? "px-2 py-0.5" : "px-3 py-1";

  const items: { label: string; value: number; unit: string; color: string }[] = [
    { label: "kcal", value: macros.kcal, unit: "", color: "bg-orange-100 text-orange-700" },
    { label: "protein", value: macros.protein, unit: "g", color: "bg-blue-100 text-blue-700" },
    { label: "carbs", value: macros.carbs, unit: "g", color: "bg-yellow-100 text-yellow-700" },
    { label: "fat", value: macros.fat, unit: "g", color: "bg-red-100 text-red-700" },
  ];

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(({ label, value, unit, color }) => (
        <span
          key={label}
          className={`${textSize} ${padding} ${color} rounded-full font-medium`}
        >
          {value}
          {unit} {label}
        </span>
      ))}
    </div>
  );
}
