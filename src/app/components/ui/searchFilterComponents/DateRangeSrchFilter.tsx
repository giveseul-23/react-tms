"use client";

import type React from "react";
import { Calendar, Clock } from "lucide-react";
import { cn } from "../utils";
import { Input } from "@/app/components/ui/input";

type DateGranularity = "date" | "datetime";
type DateMode = "single" | "range";

type DateFilterProps = React.ComponentPropsWithoutRef<"div"> & {
  label?: string;

  /** single | range */
  mode?: DateMode;

  /** date(년월일) | datetime(년월일시) */
  granularity?: DateGranularity;

  /** ids */
  fromId?: string;
  toId?: string;

  /** values */
  fromValue: string;
  toValue?: string;

  /** handlers */
  onChangeFrom: (value: string) => void;
  onChangeTo?: (value: string) => void;

  required?: boolean;
};

export function DateRangeFilter({
  label = "날짜",
  mode = "range",
  granularity = "date",

  fromId = "dateFrom",
  toId = "dateTo",

  fromValue,
  toValue = "",

  onChangeFrom,
  onChangeTo,

  className,
  required,
  ...props
}: DateFilterProps) {
  const inputType = granularity === "datetime" ? "datetime-local" : "date";
  const Icon = granularity === "datetime" ? Clock : Calendar;

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      {/* input area */}
      <div className="flex items-center gap-3">
        {/* from / single */}
        <div className="relative flex-1">
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id={fromId}
            type={inputType}
            value={fromValue}
            onChange={(e) => onChangeFrom(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* range only */}
        {mode === "range" && (
          <>
            <span className="text-gray-400 select-none">-</span>

            <div className="relative flex-1">
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id={toId}
                type={inputType}
                value={toValue}
                onChange={(e) => onChangeTo?.(e.target.value)}
                className="pl-10"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
