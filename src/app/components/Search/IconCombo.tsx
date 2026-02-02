"use client";

import {
  Equal,
  Percent,
  Parentheses,
  EqualNot,
  ChevronRight,
  ChevronLeft,
  ChevronLast,
  ChevronFirst,
  CircleSlash,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";

const ICON_OPTIONS = [
  { value: "equal", label: "완전일치", Icon: Equal },
  { value: "notEqual", label: "불일치", Icon: EqualNot },
  { value: "percent", label: "부분일치", Icon: Percent },
  { value: "parentheses", label: "포함", Icon: Parentheses },
  { value: "chevronRight", label: "초과", Icon: ChevronRight },
  { value: "chevronLeft", label: "미만", Icon: ChevronLeft },
  { value: "chevronLast", label: "이상", Icon: ChevronLast },
  { value: "chevronFirst", label: "이하", Icon: ChevronFirst },
  { value: "notUsed", label: "사용안함", Icon: CircleSlash },
];

type IconComboProps = {
  currentValue: string; // ⭐ 현재 선택된 condition
  onSelect: (value: string) => void;
};

export function IconCombo({ currentValue, onSelect }: IconComboProps) {
  return (
    <ul className="min-w-max rounded-md border bg-white shadow-lg py-1">
      {ICON_OPTIONS.map((opt) => {
        const selected = opt.value === currentValue;

        return (
          <li key={opt.value}>
            <button
              type="button"
              onClick={() => onSelect(opt.value)}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 text-sm",
                "hover:bg-gray-100",
                selected && "font-semibold bg-gray-50",
              )}
            >
              <opt.Icon
                className={cn(
                  "w-4 h-4",
                  selected && "text-[rgb(var(--primary))]",
                )}
              />
              <span className={cn(selected && "text-[rgb(var(--primary))]")}>
                {opt.label}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
