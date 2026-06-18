"use client";

// 예상도착시간 예측 팝업 — 운송시작일(TRNS_STDT_DATE) 입력.
// 서버 dspchpln.pop.PredictEstimateTimetoArrivalPop 대응.
//   날짜 1필드만 입력 → 부모가 ATD_DTTM 세팅 후 /mapService/updateStopEstAndCalDTTM 호출.

import { useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { DatePickerPopover } from "@/app/components/Search/filters/DatePickerPopover";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  initialValues?: { TRNS_STDT_DATE?: string };
  // 운송시작일(YYYY-MM-DD) 반환
  onConfirm: (data: { TRNS_STDT_DATE: string }) => void;
  onClose: () => void;
};

// "YYYYMMDD[HHMMSS]" / "YYYY-MM-DD..." → 데이트타임피커용 "YYYY-MM-DDTHH:MM:SS"
function toPickerDateTime(v?: string): string {
  if (!v) return "";
  const digits = String(v).replace(/[^0-9]/g, "");
  if (digits.length < 8) return "";
  const date = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  if (digits.length >= 14) {
    return `${date}T${digits.slice(8, 10)}:${digits.slice(10, 12)}:${digits.slice(12, 14)}`;
  }
  return date;
}

export default function PredictEstimateTimetoArrivalPop({
  initialValues,
  onConfirm,
  onClose,
}: Props) {
  const [trnsStdtDate, setTrnsStdtDate] = useState(
    toPickerDateTime(initialValues?.TRNS_STDT_DATE),
  );

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      confirmLabel="저장"
      isValid={!!trnsStdtDate}
      onCancel={onClose}
      onConfirm={() =>
        // "YYYY-MM-DDTHH:MM:SS" → "YYYYMMDDHH24MISS" (비숫자 일괄 제거)
        onConfirm({ TRNS_STDT_DATE: trnsStdtDate.replace(/\D/g, "") })
      }
    >
      <p className="text-sm text-gray-700 dark:text-slate-100">
        {Lang.get("MSG_INSERT_ETA_START_TIME")}
      </p>
      <div className="grid grid-cols-3 items-center gap-3">
        <label className="text-sm font-medium text-gray-700 dark:text-slate-100">
          {Lang.get("LBL_TRANSPORTATION_START_DATE")}{" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="col-span-2">
          <DatePickerPopover
            withTime
            value={trnsStdtDate}
            onChange={setTrnsStdtDate}
          />
        </div>
      </div>
    </FormPopupLayout>
  );
}
