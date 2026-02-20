"use client";

import type React from "react";
import { Input } from "../../ui/input";
import { Search } from "lucide-react";
import { cn } from "../../ui/utils";

export type TextFilterProps = React.ComponentPropsWithoutRef<"div"> & {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  inputClassName?: string;
  className?: string;
};

export function TextFilter({
  placeholder = "입력하세요",
  value,
  onChange,
  className,
  inputClassName,
  ...props
}: TextFilterProps) {
  return (
    // ⭐ 부모가 준 폭을 무조건 100% 사용
    <div className={cn("w-full min-w-0", className)}>
      <div className="relative w-full">
        {/* 🔍 icon → 오른쪽 */}
        <Search className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />

        {/* input */}
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full pr-7 pl-2 text-[11px] h-7", // ⭐ 오른쪽 padding
            inputClassName,
          )}
        />
      </div>
    </div>
  );
}
