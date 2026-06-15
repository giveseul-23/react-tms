"use client";

// 운송일변경 팝업 — 선택 배차행들의 운송일(DLVRY_DT)을 일괄 변경.
// 서버 dspchplnveh.pop.changedlvrydate.ChangeDlvryDatePop 대응.
//   변경 운송일 1필드만 입력 → 부모가 /dispatchPlanVehService/changeDlvryDate 호출.

import { useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { DatePickerPopover } from "@/app/components/Search/filters/DatePickerPopover";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  // 선택 배차행(첫 행 운송일을 기본값으로 사용)
  initialValues?: { DLVRY_DT?: string };
  // 선택한 운송일(YYYY-MM-DD) 반환
  onConfirm: (dlvryDt: string) => void;
  onClose: () => void;
};

// "YYYYMMDD" / "YYYY-MM-DD..." → 데이트피커용 "YYYY-MM-DD"
function toPickerDate(v?: string): string {
  if (!v) return "";
  const digits = String(v).replace(/[^0-9]/g, "");
  if (digits.length >= 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }
  return "";
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
      confirmLabel="확인"
      isValid={!!dlvryDt}
      onCancel={onClose}
      onConfirm={() => onConfirm(dlvryDt)}
    >
      <div className="grid grid-cols-3 items-center gap-3">
        <label className="text-sm font-medium text-gray-700 dark:text-slate-100">
          {Lang.get("LBL_CHANGE_DELIVERY_DATE")}
          {" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="col-span-2">
          <DatePickerPopover value={dlvryDt} onChange={setDlvryDt} />
        </div>
      </div>
    </FormPopupLayout>
  );
}
