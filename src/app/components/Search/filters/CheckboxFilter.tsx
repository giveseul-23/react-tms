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
  label,
  checked,
  onCheckedChange,
  description,
  required,
  ...props
}: CheckboxFilterProps) {
  return (
    <div
      className={cn("w-full min-w-0 flex flex-col gap-2", className)}
      {...props}
    >
      <label
        htmlFor={id}
        className={cn(
          "flex items-center gap-2 rounded-xl border bg-[rgb(var(--bg))] px-3 py-2",
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
          className={cn(
            "h-4 w-4 rounded border-gray-300",
            "accent-emerald-600",
          )}
        />

        <span className="text-sm text-[rgb(var(--fg))] select-none">
          {checked ? "Checked" : "UnChecked"}
        </span>

        {description && (
          <span className="ml-auto text-xs text-[rgb(var(--fg))]">
            {description}
          </span>
        )}
      </label>
    </div>
  );
}
