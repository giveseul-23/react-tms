"use client";

import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { cn } from "../../ui/utils";

type ComboFilterProps = {
  className?: string;
  value: string;
  onChange: (value: string) => void;

  label?: string;
  selectId?: string;
  placeholder?: string;
  inputClassName?: string;
  options?: { CODE: string; NAME: string }[];
  required?: boolean;
};

export function ComboFilter({
  value,
  onChange,
  options,
  label = "콤보",
  selectId = "category",
  placeholder = "선택",
  className,
  inputClassName,
  required,
  ...props
}: ComboFilterProps) {
  const safeOptions = (options ?? []).filter(
    (opt) => String(opt?.CODE ?? "").trim() !== "",
  );

  const resolvedValue =
    value && safeOptions.some((opt) => opt.CODE === value)
      ? value
      : (safeOptions[0]?.CODE ?? "");

  useEffect(() => {
    if (safeOptions.length === 0) return;
    if (!value || !safeOptions.some((opt) => opt.CODE === value)) {
      onChange(safeOptions[0].CODE);
    }
  }, [safeOptions, value, onChange]);

  return (
    <div className={cn(className ? "w-full min-w-0" : className)}>
      <Select
        value={resolvedValue || undefined}
        onValueChange={onChange}
        disabled={safeOptions.length === 0}
      >
        <SelectTrigger
          id={selectId}
          className={cn(
            `!h-6 !min-h-0 px-2 text-[11px] [&>svg]:h-3 [&>svg]:w-3`,
            inputClassName,
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>
          {safeOptions.map((opt, index) => (
            <SelectItem
              key={`${opt.CODE}-${index}`}
              value={opt.CODE}
              className="text-xs"
            >
              {opt.NAME}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
