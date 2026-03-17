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

  const trackBackground = `linear-gradient(to right, #22c55e 0%, #06b6d4 ${pct}%, rgba(255,255,255,0.1) ${pct}%, rgba(255,255,255,0.1) 100%)`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
          {label}
        </label>
        <span
          className="rounded-full px-3 py-0.5 text-sm font-bold"
          style={{
            background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(6,182,212,0.2))",
            border: "1px solid rgba(34,197,94,0.3)",
            color: "#22c55e",
          }}
        >
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
        className="gradient-slider w-full"
        style={{ background: trackBackground }}
      />

      <div className="flex justify-between text-xs text-slate-600">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
