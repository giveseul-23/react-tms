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
import { cn } from "../utils";

type ComboOption = {
  value: string;
  label: string;
};

type ComboFilterProps = React.ComponentPropsWithoutRef<"div"> & {
  value: string;
  onChange: (value: string) => void;

  label?: string;
  selectId?: string;
  placeholder?: string;
  inputClassName?: string;
  options: ComboOption[];
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
  return (
    <div
      className={cn(
        "w-full min-w-0", // ⭐ 핵심
        className,
      )}
      {...props}
    >
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={selectId}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
