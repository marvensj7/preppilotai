"use client";

type Tab = "simple" | "advanced";

interface TabToggleProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

export default function TabToggle({ activeTab, onChange }: TabToggleProps) {
  return (
    <div className="tab-container" role="tablist">
      {(["simple", "advanced"] as Tab[]).map((tab) => (
        <button
          key={tab}
          role="tab"
          aria-selected={activeTab === tab}
          className={`tab-btn${activeTab === tab ? " active" : ""}`}
          onClick={() => onChange(tab)}
          type="button"
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
