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

  const checkedCount = checked.size;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Progress */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="label">{checkedCount}/{items.length} collected</span>
        {checkedCount > 0 && (
          <button
            onClick={() => setChecked(new Set())}
            style={{
              background: "none",
              border: "none",
              fontSize: 11,
              color: "#555",
              cursor: "pointer",
              letterSpacing: "0.04em",
            }}
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: "#1e1e1e", borderRadius: 1 }}>
        <div
          style={{
            height: "100%",
            background: "#c0c0c0",
            borderRadius: 1,
            width: `${(checkedCount / items.length) * 100}%`,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {/* Items */}
      <ul style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, margin: 0, padding: 0, listStyle: "none" }}>
        {items.map((item) => {
          const isChecked = checked.has(item);
          return (
            <li key={item}>
              <button
                type="button"
                onClick={() => toggle(item)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "6px 4px",
                  cursor: "pointer",
                  textAlign: "left",
                  borderRadius: 4,
                  transition: "background 0.1s",
                }}
              >
                {/* Checkbox */}
                <span
                  style={{
                    flexShrink: 0,
                    width: 16,
                    height: 16,
                    borderRadius: 3,
                    border: `1px solid ${isChecked ? "#c0c0c0" : "#333"}`,
                    background: isChecked ? "#c0c0c0" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease",
                  }}
                >
                  {isChecked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>

                <span
                  style={{
                    fontSize: 13,
                    color: isChecked ? "#444" : "#888",
                    textDecoration: isChecked ? "line-through" : "none",
                    transition: "all 0.15s ease",
                    lineHeight: 1.4,
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
