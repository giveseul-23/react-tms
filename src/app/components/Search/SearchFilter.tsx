"use client";

import { CheckboxFilter } from "@/app/components/Search/filters/CheckboxFilter";
import { ComboFilter } from "@/app/components/Search/filters/ComboFilter";
import { DateRangeFilter } from "@/app/components/Search/filters/DateRangeFilter";
import { PopupFilter } from "@/app/components/Search/filters/PopupFilter";
import { TextFilter } from "@/app/components/Search/filters/TextFilter";
import { SearchFilterLabel } from "@/app/components/Search/SearchFilterLabel";
import { ConditionBox } from "@/app/components/Search/conditionBox";
import { cn } from "../ui/utils";

/* =======================
 * Base Props
 * ======================= */
type BaseFilterProps = {
  className?: string;
  span?: number;
  condition?: string;
  onConditionChange?: (c: string) => void;
  conditionLocked?: boolean;
};

/* =======================
 * Checkbox
 * ======================= */
type CheckboxFilterProps = BaseFilterProps & {
  type: "CHECKBOX";
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
  type: "COMBO";
  label: string;
  value: string;
  options?: { CODE: string; NAME: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
};

/* =======================
 * Text
 * ======================= */
type TextFilterProps = BaseFilterProps & {
  type: "TEXT";
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
};

/* =======================
 * Date Range
 * ======================= */
type DateMode = "Y" | "N";

type DateRangeFilterProps = BaseFilterProps & {
  type: "YMD" | "YMDT";
  label: string;
  fromValue: string;
  toValue: string;
  onChange?: (value: string) => void;
  onChangeFrom?: (value: string) => void;
  onChangeTo?: (value: string) => void;
  required?: boolean;
  mode?: DateMode;
};

/* =======================
 * Popup
 * ======================= */
type PopupFilterProps = BaseFilterProps & {
  type: "POPUP";
  label: string;
  code: string;
  name: string;
  sqlId: string;
  onChangeCode?: (v: string) => void;
  onChangeName?: (v: string) => void;
  onClickSearch: () => void;
  /** code/name input 에서 Enter 입력 시 호출 (직접 조회 후 단건 자동 적용 등) */
  onEnterSubmit?: (code: string, name: string) => void;
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
    conditionLocked,
    required,
  } = props;

  return (
    <div
      className={cn(
        SPAN_CLASS[span],
        "flex items-center gap-8 min-w-0",
        className,
      )}
    >
      {/* Label */}
      <div className={cn(LABEL_WIDTH, "shrink-0 flex items-center gap-1")}>
        {condition !== undefined && (
          <ConditionBox
            value={condition ?? "equal"}
            onChange={onConditionChange ?? (() => {})}
            disabled={conditionLocked}
          />
        )}
        <SearchFilterLabel
          label={label}
          required={required}
          onDoubleClick={() => {
            if (props.type === "TEXT") {
              props.onChange("");
            } else if (props.type === "COMBO") {
              props.onChange("");
            } else if (props.type === "YMD" || props.type === "YMDT") {
              if (props.mode === "N") {
                props.onChange?.("");
              } else {
                props.onChangeFrom?.("");
                props.onChangeTo?.("");
              }
            } else if (props.type === "POPUP") {
              props.onChangeCode?.("");
              props.onChangeName?.("");
            }
          }}
        />
      </div>

      {/* Input */}
      <div className="flex-1 min-w-0">
        {props.type === "CHECKBOX" && <CheckboxFilter {...props} />}
        {props.type === "COMBO" && <ComboFilter {...props} />}
        {props.type === "TEXT" && <TextFilter {...props} />}
        {props.type === "YMD" && <DateRangeFilter {...props} />}
        {props.type === "YMDT" && (
          <DateRangeFilter {...props} granularity="datetime" />
        )}
        {props.type === "POPUP" && <PopupFilter {...props} />}
      </div>
    </div>
  );
}
