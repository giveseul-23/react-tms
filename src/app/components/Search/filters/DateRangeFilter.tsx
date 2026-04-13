"use client";

import type React from "react";
import { Input } from "@/app/components/ui/input";

type DateGranularity = "date" | "datetime";
type DateMode = "Y" | "N";

type DateFilterProps = {
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
  mode = "Y",
  granularity = "date",

  fromId = "dateFrom",
  toId = "dateTo",

  fromValue = "",
  toValue = "",

  onChangeFrom,
  onChangeTo,
}: DateFilterProps) {
  const inputType = granularity === "datetime" ? "datetime-local" : "date";
  const isDatetime = granularity === "datetime";
  const today = getToday(granularity);

  const from = fromValue || today;
  const to = toValue || today;

  const inputClass =
    `relative h-7 pl-2 ${isDatetime ? "pr-10" : "pr-6"} text-[11px] leading-none tracking-tight ` +
    "dark:[color-scheme:dark] dark:text-white";

  // datetime-local 전용 속성: 24h 표기(ko-KR-u-hc-h23) + 초 단위까지 표시
  const dtExtra = isDatetime
    ? ({ lang: "ko-KR-u-hc-h23", step: 1 } as const)
    : {};

  /* ---------- single ---------- */
  if (mode === "N") {
    return (
      <Input
        id={fromId}
        type={inputType}
        value={from}
        onChange={(e) => onChangeFrom(e.target.value)}
        className={inputClass}
        {...dtExtra}
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
        {...dtExtra}
      />

      <span className="text-xs text-muted-foreground select-none">~</span>

      <Input
        id={toId}
        type={inputType}
        value={to}
        onChange={(e) => onChangeTo?.(e.target.value)}
        className={inputClass}
        {...dtExtra}
      />
    </div>
  );
}
