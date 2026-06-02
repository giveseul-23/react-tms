// src/components/common/FormBodyRenderer.tsx
import {
  ColumnDef,
  AREA_LABELS,
} from "@/features/tms/resources/vehicleMgmt/VehicleMgmtColumns";

import FormInput from "@/app/components/common/FormInput";
import FormSelect from "@/app/components/common/FormSelect";
import FormCheckbox from "@/app/components/common/FormCheckbox";
import PopupField from "@/app/components/common/PopupField";
import { DatePickerPopover } from "@/app/components/Search/filters/DatePickerPopover";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  columns: ColumnDef[];
  data: Record<string, any>;
  onChange: (field: string, value: any) => void;
  onPopupSearch: (
    sqlProp: string,
    codeField: string,
    nameField?: string,
  ) => void;
  codeMap: Record<string, Record<string, string>>;
  mode?: "new" | "edit";
  /** 특정 areaNo만 렌더링 (없으면 전체) */
  areas?: number[];
};

export function FormBodyRenderer({
  columns,
  data,
  onChange,
  onPopupSearch,
  codeMap,
  mode,
  areas,
}: Props) {
  // formHide 제거 후 areaNo별 그룹핑
  const grouped = columns
    .filter((col) => !col.formHide && col.field && col.areaNo !== undefined)
    .reduce<Record<number, ColumnDef[]>>((acc, col) => {
      const key = col.areaNo!;
      (acc[key] ??= []).push(col);
      return acc;
    }, {});

  const areaKeys = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b)
    .filter((k) => !areas || areas.includes(k));

  return (
    <div className="space-y-4">
      {areaKeys.map((areaNo) => (
        <section key={areaNo}>
          {/* 섹션 타이틀 */}
          <h3 className="text-sm font-semibold text-gray-500 border-b pb-1 mb-2">
            {AREA_LABELS[areaNo] ?? `그룹 ${areaNo}`}
          </h3>

          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
            {grouped[areaNo].map((col) => (
              <FormField
                key={col.field}
                col={col}
                value={data[col.field!]}
                nameValue={col.nameValue ? data[col.nameValue] : undefined}
                onChange={onChange}
                onPopupSearch={onPopupSearch}
                options={col.codeKey ? codeMap[col.codeKey] : undefined}
                mode={mode}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ── 개별 필드 렌더링 ──────────────────────────────────────── */
function FormField({
  col,
  value,
  nameValue,
  onChange,
  onPopupSearch,
  options,
  mode,
}: {
  col: ColumnDef;
  value: any;
  nameValue?: string;
  onChange: (field: string, value: any) => void;
  onPopupSearch: (
    sqlProp: string,
    codeField: string,
    nameField?: string,
  ) => void;
  options?: Record<string, string>;
  mode?: "new" | "edit";
}) {
  const {
    field,
    headerName,
    type,
    fieldType,
    dateUnit,
    readOnly,
    sqlProp,
    nameField,
  } = col;
  // required 는 top-level prop 또는 validators.required 둘 다 인정 (그리드와 동일).
  const required =
    col.required === true || (col as any).validators?.required === true;

  const headerNameSetLang = Lang.get(headerName);
  // 그리드와 동일한 위젯을 폼에도 — type 이 의미있는 위젯(text 아님)이면 type,
  // 아니면 fieldType fallback. (vehicleMgmt 처럼 type:"text"+fieldType 인 화면 호환)
  const kind = type && type !== "text" ? type : fieldType;

  switch (kind) {
    case "popup":
    case "popuser":
      return (
        <PopupField
          label={headerNameSetLang}
          required={required}
          codeValue={value ?? ""}
          nameLabel={Lang.get(nameField ? nameField : undefined)}
          nameValue={nameValue}
          onSearch={() => onPopupSearch(sqlProp!, field!, nameField)}
          readOnly={readOnly}
        />
      );

    case "select":
    case "combo":
      return (
        <FormSelect
          label={headerNameSetLang}
          required={required}
          value={value ?? ""}
          options={
            options
              ? Object.entries(options).map(([code, name]) => ({
                  value: code,
                  label: name,
                }))
              : []
          }
          onChange={(v) => onChange(field!, v)}
          disabled={readOnly}
        />
      );

    case "check":
      return (
        <FormCheckbox
          label={headerNameSetLang}
          checked={value === "Y"}
          onChange={(v) => onChange(field!, v ? "Y" : "N")}
          disabled={readOnly}
        />
      );

    case "date":
    case "datetime":
      return (
        <FormDateField
          label={headerNameSetLang}
          required={required}
          value={value}
          dateUnit={dateUnit}
          onChange={(v) => onChange(field!, v)}
          readOnly={readOnly}
        />
      );

    case "number":
    case "numeric":
    default: // "text"
      return (
        <FormInput
          label={headerNameSetLang}
          required={required}
          value={value ?? ""}
          onChange={(v) => onChange(field!, v)}
          readOnly={readOnly}
        />
      );
  }
}

/* ── 날짜 입력 — 그리드 date 셀과 동일한 DatePickerPopover (dateUnit 단위) ── */
function FormDateField({
  label,
  required,
  value,
  dateUnit = "day",
  onChange,
  readOnly,
}: {
  label: string;
  required?: boolean;
  value: any;
  dateUnit?: "year" | "month" | "day";
  onChange: (v: string) => void;
  readOnly?: boolean;
}) {
  // 저장값(compact: YYYY/YYYYMM/YYYYMMDD) ↔ 피커값(대시) 변환
  const toPicker = (raw: any): string => {
    if (raw == null || raw === "") return "";
    const s = String(raw).replace(/[\s\-:/T]/g, "");
    if (dateUnit === "year") return s.length >= 4 ? s.slice(0, 4) : "";
    if (dateUnit === "month")
      return s.length >= 6 ? `${s.slice(0, 4)}-${s.slice(4, 6)}` : "";
    return s.length >= 8
      ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
      : "";
  };
  const toCompact = (v: string) => v.replace(/[\s\-:T]/g, "");

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-muted-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {readOnly ? (
        <input
          className="h-8 rounded-md border border-input px-2.5 text-xs bg-muted text-muted-foreground cursor-default"
          value={toPicker(value)}
          readOnly
        />
      ) : (
        <DatePickerPopover
          value={toPicker(value)}
          precision={dateUnit}
          onChange={(v) => onChange(v ? toCompact(v) : "")}
        />
      )}
    </div>
  );
}
