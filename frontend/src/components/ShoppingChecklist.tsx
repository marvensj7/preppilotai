"use client";

import { useState } from "react";

interface ShoppingChecklistProps {
  items: string[];
}

export default function ShoppingChecklist({ items }: ShoppingChecklistProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function toggle(item: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
  }

  function clearAll() {
    setChecked(new Set());
  }

  const checkedCount = checked.size;

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{checkedCount} of {items.length} items collected</span>
        {checkedCount > 0 && (
          <button
            onClick={clearAll}
            className="text-slate-600 transition-colors hover:text-slate-400"
          >
            Clear all
          </button>
        )}
      </div>
      <div
        className="h-1.5 w-full rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${(checkedCount / items.length) * 100}%`,
            background: "linear-gradient(90deg, #22c55e, #06b6d4)",
          }}
        />
      </div>

      {/* Items grid */}
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((item) => {
          const isChecked = checked.has(item);
          return (
            <li key={item}>
              <button
                type="button"
                onClick={() => toggle(item)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200"
                style={{
                  background: isChecked
                    ? "rgba(34,197,94,0.08)"
                    : "rgba(255,255,255,0.03)",
                  border: isChecked
                    ? "1px solid rgba(34,197,94,0.25)"
                    : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Checkbox */}
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-all duration-200"
                  style={{
                    background: isChecked
                      ? "linear-gradient(135deg, #22c55e, #06b6d4)"
                      : "rgba(255,255,255,0.06)",
                    border: isChecked ? "none" : "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  {isChecked && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>

                <span
                  className="text-sm transition-all duration-200"
                  style={{
                    color: isChecked ? "rgba(148,163,184,0.5)" : "#cbd5e1",
                    textDecoration: isChecked ? "line-through" : "none",
                  }}
                >
                  {item}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
