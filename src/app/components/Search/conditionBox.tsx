"use client";

import { useState, useRef, useEffect } from "react";
import { IconCombo } from "./IconCombo";
import { getConditionIcon } from "./conditionIcons";

export function ConditionBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const Icon = getConditionIcon(value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="inline-flex items-center justify-center w-5 h-5"
        onClick={() => setOpen((v) => !v)}
      >
        <Icon className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute z-9999 mt-1">
          <IconCombo
            currentValue={value} // ⭐ userCondition 그대로
            onSelect={(v) => {
              onChange?.(v);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
