"use client";

import { DatePickerPopover } from "./DatePickerPopover";

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
  const isDatetime = granularity === "datetime";

  /* ---------- single ---------- */
  if (mode === "N") {
    return (
      <DatePickerPopover
        id={fromId}
        value={fromValue}
        onChange={onChangeFrom}
        withTime={isDatetime}
      />
    );
  }

  /* ---------- range ---------- */
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-1 min-w-0">
      <DatePickerPopover
        id={fromId}
        value={fromValue}
        onChange={onChangeFrom}
        withTime={isDatetime}
      />

      <span className="text-xs text-muted-foreground select-none">~</span>

      <DatePickerPopover
        id={toId}
        value={toValue}
        onChange={(v) => onChangeTo?.(v)}
        withTime={isDatetime}
      />
    </div>
  );
}
