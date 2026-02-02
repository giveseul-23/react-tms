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
    <div
      className={cn(
        "w-full min-w-0", // ⭐ 핵심
        className,
      )}
      {...props}
    >
      <div className="relative w-full">
        {/* icon */}
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

        {/* input */}
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full pl-10", // ⭐ input도 100%
            inputClassName,
          )}
        />
      </div>
    </div>
  );
}
