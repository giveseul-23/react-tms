"use client";

// 기간구분 변경 팝업 (서버 pop/TermTpPop 대응)
// From/To 운송일 + 기간구분(TERM_TP) 입력 → 부모 Controller 가 saveTermTp 호출.

import { useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";
import { DatePickerPopover } from "@/app/components/Search/filters/DatePickerPopover";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  initialValues?: { FRM_DTTM?: string; TO_DTTM?: string };
  termTpOptions: { CODE: string; NAME: string }[];
  onConfirm: (data: { FRM_DTTM: string; TO_DTTM: string; TERM_TP: string }) => void;
  onClose: () => void;
};

export function TermTpPop({
  initialValues = {},
  termTpOptions,
  onConfirm,
  onClose,
}: Props) {
  const [frm, setFrm] = useState(initialValues.FRM_DTTM ?? "");
  const [to, setTo] = useState(initialValues.TO_DTTM ?? "");
  const [termTp, setTermTp] = useState("10"); // 서버 기본값 '10'

  // 필수 + 시작일 <= 종료일
  const isValid = !!(frm && to && termTp) && frm <= to;

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      confirmLabel="저장"
      isValid={isValid}
      onCancel={onClose}
      onConfirm={() => onConfirm({ FRM_DTTM: frm, TO_DTTM: to, TERM_TP: termTp })}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {Lang.get("LBL_FROM_DTTM")} <span className="text-red-500">*</span>
        </label>
        <DatePickerPopover value={frm} onChange={setFrm} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {Lang.get("LBL_TO_DTTM")} <span className="text-red-500">*</span>
        </label>
        <DatePickerPopover value={to} onChange={setTo} />
      </div>
      <Field
        layout="vertical"
        type="combo"
        label={Lang.get("LBL_TERM_TP")}
        value={termTp}
        onChange={setTermTp}
        options={termTpOptions}
      />
    </FormPopupLayout>
  );
}
