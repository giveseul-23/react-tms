// src/components/common/FormBodyRenderer.tsx
import { ColumnDef, AREA_LABELS } from "@/views/vehicleMgmt/VehicleMgmtColumns";

import FormInput from "@/app/components/common/FormInput";
import FormSelect from "@/app/components/common/FormSelect";
import FormCheckbox from "@/app/components/common/FormCheckbox";
import PopupField from "@/app/components/common/PopupField";
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
                options={col.optionsKey ? codeMap[col.optionsKey] : undefined}
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
    fieldType,
    required,
    readOnly,
    sqlProp,
    nameField,
  } = col;

  const headerNameSetLang = Lang.get(headerName);

  switch (fieldType) {
    case "popup":
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
      return (
        <FormInput
          label={headerNameSetLang}
          required={required}
          value={value ?? ""}
          onChange={(v) => onChange(field!, v)}
          readOnly={readOnly}
          type="date"
        />
      );

    case "number":
      return (
        <FormInput
          label={headerNameSetLang}
          required={required}
          value={value ?? ""}
          onChange={(v) => onChange(field!, v)}
          readOnly={readOnly}
          type="number"
        />
      );

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
