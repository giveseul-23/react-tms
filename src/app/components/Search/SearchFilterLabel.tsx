"use client";

import { Label } from "@/app/components/ui/label";
import { cn } from "../ui/utils";

export function SearchFilterLabel({
  label,
  condition,
  className,
  required,
}: {
  label: string;
  condition?: React.ReactNode;
  className?: string;
  required?: string;
}) {
  return (
    <Label
      className={cn(
        "flex items-center gap-1 text-sm font-medium whitespace-nowrap",
        className,
      )}
    >
      {condition && (
        <span className="inline-flex items-center">{condition}</span>
      )}
      <span>{label}</span>
      {required && <span className="text-red-400">*</span>}
    </Label>
  );
}
