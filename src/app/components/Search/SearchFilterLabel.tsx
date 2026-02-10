"use client";

import { Label } from "@/app/components/ui/label";
import { cn } from "../ui/utils";

export function SearchFilterLabel({
  label,
  className,
  required,
}: {
  label: string;
  className?: string;
  required?: boolean;
}) {
  return (
    <Label
      className={cn(
        "flex items-center text-[11px] font-medium leading-6 whitespace-nowrap",
        className,
      )}
    >
      <span>{label}</span>
      {required && <span className="ml-0.5 text-red-400">*</span>}
    </Label>
  );
}
