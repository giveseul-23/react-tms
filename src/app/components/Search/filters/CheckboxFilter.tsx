"use client";

import * as React from "react";
import { cn } from "../../ui/utils";

export type CheckboxFilterProps = React.ComponentPropsWithoutRef<"div"> & {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  description?: string; // 선택: 오른쪽/아래 설명
  required?: boolean;
};

export function CheckboxFilter({
  className,
  id,
  checked,
  onCheckedChange,
  description,
  ...props
}: CheckboxFilterProps) {
  return (
    <div className={cn("w-full min-w-0", className)}>
      <label
        htmlFor={id}
        className={cn(
          "flex items-center gap-2",
          "h-6 px-2 py-0",
          "rounded-md border bg-[rgb(var(--bg))]",
          "transition-colors",
          checked
            ? "border-emerald-300 ring-1 ring-emerald-200"
            : "border-gray-200",
        )}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="
          h-3 w-3
          translate-y-[0.2px]   // 🔥 핵심
          rounded border-gray-300
          accent-emerald-600
        "
        />

        <span className="text-[11px] leading-none text-[rgb(var(--fg))] select-none">
          {checked ? "Checked" : "UnChecked"}
        </span>

        {description && (
          <span className="ml-auto text-[11px] text-[rgb(var(--fg))]">
            {description}
          </span>
        )}
      </label>
    </div>
  );
}
