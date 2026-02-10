"use client";

import { CheckboxFilter } from "@/app/components/search/filters/CheckboxFilter";
import { ComboFilter } from "@/app/components/search/filters/ComboFilter";
import { DateRangeFilter } from "@/app/components/search/filters/DateRangeFilter";
import { PopupFilter } from "@/app/components/search/filters/PopupFilter";
import { TextFilter } from "@/app/components/search/filters/TextFilter";
import { SearchFilterLabel } from "@/app/components/search/SearchFilterLabel";
import { ConditionBox } from "@/app/components/search/ConditionBox";
import { cn } from "../ui/utils";

/* =======================
 * Base Props
 * ======================= */
type BaseFilterProps = {
  className?: string;
  span?: number;
  condition?: string;
  onConditionChange?: (c: string) => void;
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
type ComboFilterProps = BaseFilterProps & {
  type: "combo";
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
};

/* =======================
 * Text
 * ======================= */
type TextFilterProps = BaseFilterProps & {
  type: "text";
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
};

/* =======================
 * Date Range
 * ======================= */
type DateRangeFilterProps = BaseFilterProps & {
  type: "dateRange";
  label: string;
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
  label: string;
  code: string;
  name: string;
  sqlId: string;
  onChangeCode: (v: string) => void;
  onChangeName: (v: string) => void;
  onClickSearch: () => void;
  required?: boolean;
};

const LABEL_WIDTH = "w-[100px]";

/* =======================
 * Union
 * ======================= */
export type SearchFilterProps =
  | CheckboxFilterProps
  | ComboFilterProps
  | TextFilterProps
  | DateRangeFilterProps
  | PopupFilterProps;

/* =======================
 * Span Map
 * ======================= */
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
  const {
    label,
    span = 3,
    className,
    condition,
    onConditionChange,
    required,
  } = props;

  return (
    <div
      className={cn(
        SPAN_CLASS[span],
        "flex items-center gap-2 min-w-0",
        className,
      )}
    >
      {/* Label */}
      <div className={cn(LABEL_WIDTH, "shrink-0 flex items-center gap-1")}>
        {onConditionChange && (
          <ConditionBox
            value={condition ?? "equal"}
            onChange={onConditionChange}
          />
        )}
        <SearchFilterLabel label={label} required={required} />
      </div>

      {/* Input */}
      <div className="flex-1 min-w-0">
        {props.type === "checkbox" && <CheckboxFilter {...props} />}
        {props.type === "combo" && <ComboFilter {...props} />}
        {props.type === "text" && <TextFilter {...props} />}
        {props.type === "dateRange" && <DateRangeFilter {...props} />}
        {props.type === "popup" && <PopupFilter {...props} />}
      </div>
    </div>
  );
}
