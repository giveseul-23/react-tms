"use client";

import { useState } from "react";
import { DatePickerPopover } from "@/app/components/Search/filters/DatePickerPopover";
import { Field } from "@/app/components/popup/Field";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  initialValues: {
    DIV_CD: string;
    LGST_GRP_CD: string;
    FRM_DTTM: string;
    TO_DTTM: string;
  };
  onConfirm: (payload: Record<string, any>) => void;
  onClose: () => void;
};

const compactDate = (value: string) => String(value ?? "").replaceAll("-", "");

export function CreateMonthlyApPop({
  initialValues,
  onConfirm,
  onClose,
}: Props) {
  const [frm, setFrm] = useState(initialValues.FRM_DTTM ?? "");
  const [to, setTo] = useState(initialValues.TO_DTTM ?? "");

  const isValid = !!frm && !!to && compactDate(frm) < compactDate(to);

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      confirmLabel={Lang.get("BTN_SAVE")}
      isValid={isValid}
      onCancel={onClose}
      onConfirm={() =>
        onConfirm({
          FRM_DTTM: compactDate(frm),
          TO_DTTM: compactDate(to),
          AP_ST_DATE: compactDate(frm),
          AP_DATE: compactDate(to),
          DIV_CD: initialValues.DIV_CD,
          LGST_GRP_CD: initialValues.LGST_GRP_CD,
        })
      }
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {Lang.get("LBL_AP_FROM_DATE")}
        </label>
        <DatePickerPopover value={frm} onChange={setFrm} size="lg" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {Lang.get("LBL_AP_END_DATE")}
        </label>
        <DatePickerPopover value={to} onChange={setTo} size="lg" />
      </div>
      <Field
        layout="vertical"
        type="text"
        disabled
        label={Lang.get("LBL_DIVISION")}
        value={initialValues.DIV_CD}
      />
      <Field
        layout="vertical"
        type="text"
        disabled
        label={Lang.get("LBL_LOGISTICS_GROUP")}
        value={initialValues.LGST_GRP_CD}
      />
    </FormPopupLayout>
  );
}
