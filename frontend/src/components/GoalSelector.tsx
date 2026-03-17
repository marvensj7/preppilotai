"use client";

import type { Goal } from "@/types/meal-plan";

interface GoalSelectorProps {
  value: Goal | null;
  onChange: (goal: Goal) => void;
}

const GOALS: { key: Goal; label: string; desc: string }[] = [
  { key: "cut",      label: "CUT",      desc: "−20% deficit" },
  { key: "maintain", label: "MAINTAIN", desc: "Balanced" },
  { key: "bulk",     label: "BULK",     desc: "+15% surplus" },
];

export default function GoalSelector({ value, onChange }: GoalSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="label">Athletic Goal</p>
      <div style={{ display: "flex", gap: 8 }}>
        {GOALS.map(({ key, label, desc }) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`goal-btn${value === key ? " active" : ""}`}
          >
            <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: "0.08em" }}>{label}</div>
            <div style={{ fontSize: 10, marginTop: 2, opacity: 0.7 }}>{desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
