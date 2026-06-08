"use client";

// 시간거리계산 기준시각 입력 팝업 (센차 BaseTimePop)
// 기준시각(HH:MM)을 받아 HHMMSS 문자열로 부모에 전달.

import { useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  onConfirm: (baseTimeHHMMSS: string) => void;
  onClose: () => void;
};

const nowHHMM = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function BaseTimePop({ onConfirm, onClose }: Props) {
  const [time, setTime] = useState(nowHHMM());

  return (
    <FormPopupLayout
      confirmLabel={Lang.get("BTN_SAVE")}
      cancelLabel={Lang.get("BTN_CANCEL")}
      isValid={!!time}
      onCancel={onClose}
      onConfirm={() => onConfirm(time.replace(":", "") + "00")}
    >
      <div className="space-y-3">
        <p className="text-sm text-gray-700 dark:text-slate-100">
          {Lang.get("MSG_INPUT_DTTO_BASETIME")}
        </p>
        <div className="grid grid-cols-3 items-center gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-100">
            {Lang.get("LBL_DTTO_BASE_TIME")}
          </label>
          <input
            type="time"
            step={600}
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="col-span-2 h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>
    </FormPopupLayout>
  );
}
