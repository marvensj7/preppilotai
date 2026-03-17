"use client";

import { useEffect, useState } from "react";

interface HybridInputProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  formatDisplay?: (v: number) => string;
  onChange: (value: number) => void;
}

export default function HybridInput({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  formatDisplay,
  onChange,
}: HybridInputProps) {
  const [inputStr, setInputStr] = useState(String(value));

  useEffect(() => {
    setInputStr(String(value));
  }, [value]);

  const pct = ((value - min) / (max - min)) * 100;
  const trackBg = `linear-gradient(to right, #c0c0c0 0%, #c0c0c0 ${pct}%, #1e1e1e ${pct}%, #1e1e1e 100%)`;

  function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setInputStr(raw);
    const n = Number(raw);
    if (!isNaN(n) && n >= min && n <= max) {
      onChange(Math.round(n / step) * step);
    }
  }

  function handleNumberBlur() {
    const n = Number(inputStr);
    if (isNaN(n) || inputStr === "") {
      setInputStr(String(value));
    } else {
      const clamped = Math.max(min, Math.min(max, Math.round(n / step) * step));
      onChange(clamped);
      setInputStr(String(clamped));
    }
  }

  function handleSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
    const n = Number(e.target.value);
    onChange(n);
    setInputStr(String(n));
  }

  const displayStr = formatDisplay ? formatDisplay(value) : `${value}${unit}`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="label">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {formatDisplay ? (
            <span style={{ fontSize: 20, fontWeight: 700, color: "#f5f5f5" }}>
              {displayStr}
            </span>
          ) : (
            <>
              <input
                type="number"
                value={inputStr}
                min={min}
                max={max}
                step={step}
                onChange={handleNumberChange}
                onBlur={handleNumberBlur}
                className="hybrid-input"
                aria-label={label}
              />
              {unit && (
                <span className="label" style={{ marginLeft: 2 }}>
                  {unit}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleSliderChange}
        className="perf-slider"
        style={{ background: trackBg }}
      />

      <div className="flex justify-between" style={{ fontSize: 11, color: "#444" }}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
