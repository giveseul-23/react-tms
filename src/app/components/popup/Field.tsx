"use client";

import { ComboFilter } from "@/app/components/Search/filters/ComboFilter";

// 폼 팝업의 라벨 + 입력 한 묶음.
// layout 두 가지 (가로 grid-cols-3 / 세로 mb-2) × type 세 가지 (text/textarea/combo).
// className 은 내부 고정 — 디자인 통일 자동 보장.
//
// 사용 예:
//   <Field layout="horizontal" type="text" label="차량번호" required
//     value={vehicleNo} onChange={setVehicleNo} placeholder="..." />
//
//   <Field layout="horizontal" type="text" disabled label="차량유형"
//     value={vehicleType} />
//
//   <Field layout="vertical" type="textarea" label="메모" rows={5}
//     value={memo} onChange={setMemo} placeholder="..." />
//
//   <Field layout="vertical" type="combo" label="사유"
//     value={reasonCode} onChange={setReasonCode}
//     options={stores.reasonOptions ?? []} placeholder="선택하세요" />

export type FieldProps = {
  layout: "horizontal" | "vertical";
  label: string;
  required?: boolean;
  disabled?: boolean;
  type: "text" | "textarea" | "combo";
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  rows?: number; // textarea
  options?: { CODE: string; NAME: string }[]; // combo
};

const LABEL_HORIZONTAL =
  "text-sm font-medium text-gray-700 dark:text-slate-100";
const LABEL_VERTICAL =
  "block text-sm font-medium text-gray-700 mb-2 dark:[color-scheme:dark] dark:text-white";

const INPUT_BASE = "h-10 rounded-lg border border-gray-300 px-3 text-sm";
const INPUT_ENABLED =
  "focus:outline-none focus:ring-2 focus:ring-blue-400";
const INPUT_DISABLED = "bg-gray-200 dark:text-slate-900";

const TEXTAREA_CLASS =
  "w-full rounded-lg border border-gray-300 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400";

const COMBO_INPUT_CLASS =
  "!h-11 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-400";

export function Field({
  layout,
  label,
  required,
  disabled,
  type,
  value,
  onChange,
  placeholder,
  rows,
  options,
}: FieldProps) {
  const labelNode = (
    <label
      className={layout === "horizontal" ? LABEL_HORIZONTAL : LABEL_VERTICAL}
    >
      {label}
      {required && (
        <>
          {" "}
          <span className="text-red-500">*</span>
        </>
      )}
    </label>
  );

  const inputNode = renderInput({
    layout,
    type,
    value,
    onChange,
    placeholder,
    rows,
    options,
    disabled,
  });

  if (layout === "horizontal") {
    return (
      <div className="grid grid-cols-3 items-center gap-3">
        {labelNode}
        {inputNode}
      </div>
    );
  }

  return (
    <div>
      {labelNode}
      {inputNode}
    </div>
  );
}

function renderInput({
  layout,
  type,
  value,
  onChange,
  placeholder,
  rows,
  options,
  disabled,
}: Pick<
  FieldProps,
  | "layout"
  | "type"
  | "value"
  | "onChange"
  | "placeholder"
  | "rows"
  | "options"
  | "disabled"
>) {
  if (type === "textarea") {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        rows={rows ?? 5}
        placeholder={placeholder}
        className={TEXTAREA_CLASS}
      />
    );
  }

  if (type === "combo") {
    return (
      <ComboFilter
        value={value}
        onChange={(v) => onChange?.(v)}
        placeholder={placeholder}
        options={options ?? []}
        className="w-full"
        inputClassName={COMBO_INPUT_CLASS}
      />
    );
  }

  // text
  const widthClass = layout === "horizontal" ? "col-span-2" : "w-full";
  const stateClass = disabled ? INPUT_DISABLED : INPUT_ENABLED;
  return (
    <input
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className={`${widthClass} ${INPUT_BASE} ${stateClass}`}
    />
  );
}
