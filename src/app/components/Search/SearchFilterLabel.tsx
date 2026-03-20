"use client";

import { Label } from "@/app/components/ui/label";
import { cn } from "../ui/utils";

export function SearchFilterLabel({
  label,
  className,
  required,
  onDoubleClick,
}: {
  label: string;
  className?: string;
  required?: boolean;
  onDoubleClick?: () => void;
}) {
  return (
    <Label
      onDoubleClick={onDoubleClick}
      className={cn(
        "flex items-center text-[11px] font-medium leading-6 whitespace-nowrap",
        onDoubleClick && "cursor-pointer select-none hover:text-[rgb(var(--primary))] transition-colors",
        className,
      )}
      title={onDoubleClick ? "더블클릭으로 초기화" : undefined}
    >
      <span>{label}</span>
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </Label>
  );
}
