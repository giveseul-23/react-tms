"use client";

import type React from "react";

/* 개별 구현체 */
import { CheckboxSrchFilter } from "./CheckboxSrchFilter";
import { ComboFilter } from "./ComboSrchFilter";
import { DateRangeFilter } from "./DateRangeSrchFilter";
import { PopupSrchFilter } from "./PopupSrchFilter";
import { TextSrchFilter } from "./TextSrchFilter";
import { SearchFilterLabel } from "./SearchFilterLabel";

import { cn } from "../utils";

/* =======================
 * Base Props
 * ======================= */
type BaseFilterProps = {
  className?: string;
  span?: number; // ⭐ 추가
};

/* =======================
 * Checkbox
 * ======================= */
type CheckboxFilterProps = BaseFilterProps & {
  type: "checkbox";
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  description?: string;
  required?: boolean;
};

/* =======================
 * Combo
 * ======================= */
type ComboOption = {
  value: string;
  label: string;
};

type ComboFilterProps = BaseFilterProps & {
  type: "combo";
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: ComboOption[];
  placeholder?: string;
  selectId?: string;
  required?: boolean;
};

/* =======================
 * Date Range
 * ======================= */
type DateRangeFilterProps = BaseFilterProps & {
  type: "dateRange";
  label?: string;
  fromValue: string;
  toValue: string;
  onChangeFrom: (value: string) => void;
  onChangeTo: (value: string) => void;
  required?: boolean;
};

/* =======================
 * Popup
 * ======================= */
type PopupFilterProps = BaseFilterProps & {
  type: "popup";
  label?: string;
  code: string;
  name: string;
  onChangeCode: (v: string) => void;
  onChangeName: (v: string) => void;
  onClickSearch: () => void;
  required?: boolean;
};

/* =======================
 * Text
 * ======================= */
type TextFilterProps = BaseFilterProps & {
  type: "text";
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
};

/* =======================
 * Union
 * ======================= */
export type SearchFilterProps =
  | CheckboxFilterProps
  | ComboFilterProps
  | DateRangeFilterProps
  | PopupFilterProps
  | TextFilterProps;

const SPAN_CLASS: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
};
/* =======================
 * Main Component
 * ======================= */
export function SearchFilter(props: SearchFilterProps) {
  const { label, required, className, span = 3 } = props;

  return (
    <div
      className={cn(
        SPAN_CLASS[span] ?? "col-span-3", // ✅ 핵심
        "flex items-center gap-3 min-w-0",
        className,
      )}
    >
      {/* Label – 고정 폭 */}
      <div className="w-[96px] shrink-0">
        <SearchFilterLabel
          label={label}
          required={required}
          className="justify-start text-left"
        />
      </div>

      {/* Input – 나머지 전부 */}
      <div className="flex-1 min-w-0">
        {(() => {
          switch (props.type) {
            case "checkbox":
              return <CheckboxSrchFilter {...props} />;

            case "combo":
              return <ComboFilter {...props} />;

            case "dateRange":
              return <DateRangeFilter {...props} />;

            case "popup":
              return <PopupSrchFilter {...props} />;

            case "text":
              return <TextSrchFilter {...props} />;

            default:
              return null;
          }
        })()}
      </div>
    </div>
  );
}
