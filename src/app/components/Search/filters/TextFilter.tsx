"use client";

import type React from "react";
import { Input } from "../../ui/input";
import { X } from "lucide-react";
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
    <div className={cn("w-full min-w-0", className)}>
      <div className="relative w-full">
        {/* X 아이콘 — 값 있을 때만 표시, 클릭 시 초기화 */}
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}

        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full text-[11px] h-7",
            value ? "pr-6 pl-2" : "px-2",
            inputClassName,
          )}
        />
      </div>
    </div>
  );
}
