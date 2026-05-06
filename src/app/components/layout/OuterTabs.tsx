"use client";

export type OuterTab = { key: string; label: string };

export interface OuterTabsProps {
  tabs: OuterTab[];
  activeTab: string;
  onChange: (key: string) => void;
}

export function OuterTabs({ tabs, activeTab, onChange }: OuterTabsProps) {
  return (
    <div className="flex gap-0.5 border-b border-border px-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`
            px-3 py-1.5 text-[11px] font-medium border-b-2 transition-colors
            ${
              activeTab === tab.key
                ? "text-[rgb(var(--primary))] border-[rgb(var(--primary))]"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
