"use client";

import { useState, useRef, useEffect } from "react";
import { IconCombo } from "./IconCombo";
import { getConditionIcon } from "./conditionIcons";
import { cn } from "../ui/utils";

export function ConditionBox({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
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
        className={cn(
          "w-5 h-5 shrink-0 inline-flex items-center justify-center",
          disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
        )}
        onClick={() => !disabled && setOpen((v) => !v)}
      >
        <Icon className="w-4 h-4" />
      </button>

      {open && !disabled && (
        <div className="absolute z-[10000] mt-1">
          <IconCombo
            currentValue={value}
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
