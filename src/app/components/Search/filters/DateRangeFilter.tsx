"use client";

import type React from "react";
import { Input } from "@/app/components/ui/input";

type DateGranularity = "date" | "datetime";
type DateMode = "single" | "range";

type DateFilterProps = React.ComponentPropsWithoutRef<"div"> & {
  mode?: DateMode;
  granularity?: DateGranularity;

  fromId?: string;
  toId?: string;

  fromValue: string;
  toValue?: string;

  onChangeFrom: (value: string) => void;
  onChangeTo?: (value: string) => void;
};

function getToday(granularity: DateGranularity) {
  const now = new Date();
  return granularity === "datetime"
    ? now.toISOString().slice(0, 16)
    : now.toISOString().slice(0, 10);
}

export function DateRangeFilter({
  mode = "range",
  granularity = "date",

  fromId = "dateFrom",
  toId = "dateTo",

  fromValue,
  toValue = "",

  onChangeFrom,
  onChangeTo,
}: DateFilterProps) {
  const inputType = granularity === "datetime" ? "datetime-local" : "date";
  const today = getToday(granularity);

  const from = fromValue || today;
  const to = toValue || today;

  const inputClass =
    "relative h-7 pl-2 pr-6 text-[11px] leading-none tracking-tight";
  /* ---------- single ---------- */
  if (mode === "single") {
    return (
      <Input
        id={fromId}
        type={inputType}
        value={from}
        onChange={(e) => onChangeFrom(e.target.value)}
        className={inputClass}
      />
    );
  }

  /* ---------- range ---------- */
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-1">
      <Input
        id={fromId}
        type={inputType}
        value={from}
        onChange={(e) => onChangeFrom(e.target.value)}
        className={inputClass}
      />

      <span className="text-xs text-muted-foreground select-none">~</span>

      <Input
        id={toId}
        type={inputType}
        value={to}
        onChange={(e) => onChangeTo?.(e.target.value)}
        className={inputClass}
      />
    </div>
  );
}
