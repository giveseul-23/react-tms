"use client";

import type React from "react";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { cn } from "../../ui/utils";

type ComboFilterProps = React.ComponentPropsWithoutRef<"div"> & {
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
  const safeOptions = options ?? [];

  return (
    <div className={cn(className ? "w-full min-w-0" : className)}>
      <Select value={value} onValueChange={onChange}>
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
          {safeOptions.map((opt) => (
            <SelectItem key={opt.CODE} value={opt.CODE} className="text-xs">
              {opt.NAME}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
