"use client";

interface SliderFieldProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  formatValue?: (v: number) => string;
  onChange: (value: number) => void;
}

export default function SliderField({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  formatValue,
  onChange,
}: SliderFieldProps) {
  const displayValue = formatValue ? formatValue(value) : `${value}${unit}`;
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <span className="rounded-lg bg-brand-100 px-2.5 py-0.5 text-sm font-semibold text-brand-700">
          {displayValue}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-brand-600"
        style={{
          background: `linear-gradient(to right, #16a34a ${pct}%, #e5e7eb ${pct}%)`,
        }}
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}
