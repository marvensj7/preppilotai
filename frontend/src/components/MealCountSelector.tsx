"use client";

interface MealCountSelectorProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export default function MealCountSelector({
  value,
  min = 2,
  max = 6,
  onChange,
}: MealCountSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="label">Meals Per Day</p>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          type="button"
          className="stepper-btn"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label="Decrease meals"
        >
          −
        </button>
        <span style={{ fontSize: 32, fontWeight: 800, color: "#f5f5f5", minWidth: 32, textAlign: "center", lineHeight: 1 }}>
          {value}
        </span>
        <button
          type="button"
          className="stepper-btn"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label="Increase meals"
        >
          +
        </button>
        <span className="label" style={{ marginLeft: 4 }}>
          meals
        </span>
      </div>
    </div>
  );
}
