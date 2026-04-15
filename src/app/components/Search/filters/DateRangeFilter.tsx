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

  // from-to 유효성 보정: from이 to보다 크면 to를 from으로, to가 from보다 작으면 from을 to로 보정
  const handleFromChange = (v: string) => {
    onChangeFrom(v);
    if (toValue && v && v > toValue) {
      onChangeTo?.(v);
    }
  };

  const handleToChange = (v: string) => {
    onChangeTo?.(v);
    if (fromValue && v && v < fromValue) {
      onChangeFrom(v);
    }
  };

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
        onChange={handleFromChange}
        withTime={isDatetime}
      />

      <span className="text-xs text-muted-foreground select-none">~</span>

      <DatePickerPopover
        id={toId}
        value={toValue}
        onChange={handleToChange}
        withTime={isDatetime}
      />
    </div>
  );
}
