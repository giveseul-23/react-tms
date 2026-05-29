"use client";

import { useMemo, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Lang } from "@/app/services/common/Lang";
import type { UiResourceRow } from "../UiResourceModel";

export type UiResourceAddFormData = {
  RSRC_ID: string;
  RSRC_DESC: string;
  RSRC_TP: string;
  PRNT_RSRC_ID: string;
};

type UiResourceAddPopupProps = {
  parentRow: UiResourceRow;
  resourceTypeMap: Record<string, string>;
  allowedChildTypes: string[];
  defaultChildType?: string;
  onConfirm: (data: UiResourceAddFormData) => void;
  onClose: () => void;
};

export default function UiResourceAddPopup({
  parentRow,
  resourceTypeMap,
  allowedChildTypes,
  defaultChildType,
  onConfirm,
  onClose,
}: UiResourceAddPopupProps) {
  const typeOptions = useMemo(
    () =>
      allowedChildTypes.map((code) => ({
        code,
        name: resourceTypeMap[code] ?? code,
      })),
    [allowedChildTypes, resourceTypeMap],
  );

  const [form, setForm] = useState({
    RSRC_ID: "",
    RSRC_DESC: "",
    RSRC_TP: defaultChildType ?? typeOptions[0]?.code ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.RSRC_ID.trim()) {
      nextErrors.RSRC_ID = Lang.get("MSG_CHK_INPUT", ["LBL_RSRC_ID"]);
    }
    if (!form.RSRC_DESC.trim()) {
      nextErrors.RSRC_DESC = Lang.get("MSG_CHK_INPUT", ["LBL_RSRC_DESC"]);
    }
    if (!form.RSRC_TP) {
      nextErrors.RSRC_TP = Lang.get("MSG_CHK_SELECT", ["LBL_RSRC_TP"]);
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;

    onConfirm({
      RSRC_ID: form.RSRC_ID.trim(),
      RSRC_DESC: form.RSRC_DESC.trim(),
      RSRC_TP: form.RSRC_TP,
      PRNT_RSRC_ID: String(parentRow.RSRC_ID ?? ""),
    });
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <Field label={Lang.get("LBL_PRNT_RSRC_ID")}>
        <Input
          value={String(parentRow.RSRC_ID ?? "")}
          readOnly
          className="h-8 text-sm bg-slate-100 cursor-not-allowed text-slate-600"
        />
      </Field>

      <Field label={Lang.get("LBL_RSRC_ID")} error={errors.RSRC_ID}>
        <Input
          value={form.RSRC_ID}
          onChange={updateField("RSRC_ID")}
          className="h-8 text-sm"
        />
      </Field>

      <Field label={Lang.get("LBL_RSRC_DESC")} error={errors.RSRC_DESC}>
        <Input
          value={form.RSRC_DESC}
          onChange={updateField("RSRC_DESC")}
          className="h-8 text-sm"
        />
      </Field>

      <Field label={Lang.get("LBL_RSRC_TP")} error={errors.RSRC_TP}>
        <select
          value={form.RSRC_TP}
          onChange={updateField("RSRC_TP")}
          className="w-full h-8 px-2 border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:border-blue-500"
        >
          <option value="">{Lang.get("BTN_TMS_SELECT")}</option>
          {typeOptions.map((option) => (
            <option key={option.code} value={option.code}>
              {option.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="flex justify-end gap-2 pt-2 border-t mt-1">
        <Button
          size="sm"
          variant="outline"
          onClick={onClose}
          className="h-7 px-4 text-xs border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          {Lang.get("BTN_CANCEL")}
        </Button>
        <Button
          size="sm"
          onClick={handleConfirm}
          className="h-7 px-4 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white"
        >
          {Lang.get("BTN_ADD")}
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-start gap-2">
      <label className="text-sm font-medium text-slate-600 pt-1">{label}</label>
      <div className="space-y-1">
        {children}
        {error ? <p className="text-xs text-red-500">{error}</p> : null}
      </div>
    </div>
  );
}
