"use client";

// 운송일(배송일) 변경 팝업 — 선택 배차행들의 DLVRY_DT 를 일괄 변경.
// 서버 pop/changedlvrydate/ChangeDlvryDatePop 대응.
//   변경 운송일 1필드만 입력 → 부모가 /dispatchPlanVehService/changeDlvryDate 호출.

import { useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { DatePickerPopover } from "@/app/components/Search/filters/DatePickerPopover";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  initialValues?: { DLVRY_DT?: string };
  onConfirm: (dlvryDt: string) => void;
  onClose: () => void;
};

function toPickerDate(v?: string): string {
  if (!v) return "";
  const d = String(v).replace(/[^0-9]/g, "");
  return d.length >= 8 ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : "";
}

export default function ChangeDlvryDatePop({
  initialValues,
  onConfirm,
  onClose,
}: Props) {
  const [dlvryDt, setDlvryDt] = useState(toPickerDate(initialValues?.DLVRY_DT));

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      confirmLabel="저장"
      isValid={!!dlvryDt}
      onCancel={onClose}
      onConfirm={() => onConfirm(dlvryDt)}
    >
      <div className="grid grid-cols-3 items-center gap-3">
        <label className="text-sm font-medium text-gray-700 dark:text-slate-100">
          {Lang.get("LBL_CHANGE_DELIVERY_DATE")} <span className="text-red-500">*</span>
        </label>
        <div className="col-span-2">
          <DatePickerPopover value={dlvryDt} onChange={setDlvryDt} />
        </div>
      </div>
    </FormPopupLayout>
  );
}
