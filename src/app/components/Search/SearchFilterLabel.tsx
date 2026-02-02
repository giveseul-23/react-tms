"use client";

import { Label } from "@/app/components/ui/label";
import ConditionBox from "./conditionBox";
import { cn } from "../ui/utils";

type SearchFilterLabelProps = {
  label?: string;
  required?: boolean;
  htmlFor?: string;
};

export function SearchFilterLabel({
  label,
  required,
  htmlFor,
  className,
}: SearchFilterLabelProps & { className?: string }) {
  if (!label) return null;

  return (
    <Label
      htmlFor={htmlFor}
      className={cn(
        "flex items-center gap-1 text-sm font-medium text-[rgb(var(--fg))] whitespace-nowrap",
        className,
      )}
    >
      <ConditionBox />
      <span>{label}</span>
      {required && <span className="text-red-400">*</span>}
    </Label>
  );
}
