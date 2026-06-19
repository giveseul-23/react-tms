"use client";

import { useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  onConfirm: (trnsStdtDate: string) => void;
  onClose: () => void;
};

const pad2 = (value: number) => String(value).padStart(2, "0");

const nowDateTimeLocal = () => {
  const date = new Date();
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
};

const toCompactDttm = (value: string) => {
  const digits = value.replace(/[^0-9]/g, "");
  return digits.length === 12 ? `${digits}00` : digits;
};

export default function StartWorkPopup({ onConfirm, onClose }: Props) {
  const [trnsStdtDate, setTrnsStdtDate] = useState(nowDateTimeLocal());

  return (
    <FormPopupLayout
      confirmLabel={Lang.get("BTN_SAVE")}
      cancelLabel={Lang.get("BTN_CANCEL")}
      isValid={!!trnsStdtDate}
      onCancel={onClose}
      onConfirm={() => onConfirm(toCompactDttm(trnsStdtDate))}
    >
      <div className="space-y-3">
        <p className="text-sm text-gray-700 dark:text-slate-100">
          {Lang.get("MSG_INSERT_WORK_START_DATETIME")}
        </p>
        <div className="grid grid-cols-3 items-center gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-100">
            {Lang.get("LBL_TRANSPORTATION_START_DATE")}
            {" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={trnsStdtDate}
            onChange={(event) => setTrnsStdtDate(event.target.value)}
            className="col-span-2 h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>
    </FormPopupLayout>
  );
}
