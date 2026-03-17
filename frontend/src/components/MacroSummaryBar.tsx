"use client";

interface MacroSummaryBarProps {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  targetCalories: number;
}

export default function MacroSummaryBar({
  protein_g,
  carbs_g,
  fat_g,
  targetCalories,
}: MacroSummaryBarProps) {
  const proteinCal = protein_g * 4;
  const carbsCal = carbs_g * 4;
  const fatCal = fat_g * 9;
  const totalMacroCal = proteinCal + carbsCal + fatCal;

  const proteinPct = totalMacroCal > 0 ? Math.round((proteinCal / totalMacroCal) * 100) : 0;
  const carbsPct = totalMacroCal > 0 ? Math.round((carbsCal / totalMacroCal) * 100) : 0;
  const fatPct = 100 - proteinPct - carbsPct;

  const diff = Math.abs(totalMacroCal - targetCalories);
  const showWarning = totalMacroCal > 0 && diff > 50;

  return (
    <div className="space-y-3" style={{ paddingTop: 4 }}>
      <p className="label">Macro Split</p>

      {/* Segment labels */}
      <div style={{ display: "flex", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", color: "#888", marginBottom: 4 }}>
        <span style={{ flex: proteinPct, color: "#c0c0c0", overflow: "hidden", whiteSpace: "nowrap" }}>
          {proteinPct > 8 ? `P ${proteinPct}%` : ""}
        </span>
        <span style={{ flex: carbsPct, textAlign: "center", overflow: "hidden", whiteSpace: "nowrap" }}>
          {carbsPct > 8 ? `C ${carbsPct}%` : ""}
        </span>
        <span style={{ flex: fatPct, textAlign: "right", color: "#555", overflow: "hidden", whiteSpace: "nowrap" }}>
          {fatPct > 8 ? `F ${fatPct}%` : ""}
        </span>
      </div>

      {/* Bar */}
      <div className="macro-bar">
        <div style={{ flex: proteinPct, background: "#c0c0c0", transition: "flex 0.3s ease" }} />
        <div style={{ flex: carbsPct, background: "#888888", transition: "flex 0.3s ease" }} />
        <div style={{ flex: fatPct, background: "#444444", transition: "flex 0.3s ease" }} />
      </div>

      {/* Calorie reconciliation */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#555" }}>
        <span>
          Macro cal: <span style={{ color: "#888" }}>{totalMacroCal} kcal</span>
        </span>
        <span>
          Target: <span style={{ color: "#888" }}>{targetCalories} kcal</span>
        </span>
      </div>

      {showWarning && (
        <p style={{ fontSize: 11, color: "#888888" }}>
          ⚠ Macro calories don&apos;t match your target
        </p>
      )}
    </div>
  );
}
