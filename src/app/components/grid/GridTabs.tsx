"use client";

export function GridTabs({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: { key: string; label: string }[];
  activeTab: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex items-center gap-8">
        {tabs.map((t) => {
          const active = t.key === activeTab;

          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              className={[
                "relative py-3 text-sm",
                active
                  ? "text-[rgb(var(--fg))] font-medium"
                  : "text-[rgb(var(--fg))] hover:text-gray-700",
              ].join(" ")}
            >
              {t.label}
              <span
                className={[
                  "absolute left-0 -bottom-[1px] h-[2px] w-full transition-opacity",
                  active ? "opacity-100 bg-[rgb(var(--primary))]" : "opacity-0",
                ].join(" ")}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
}
