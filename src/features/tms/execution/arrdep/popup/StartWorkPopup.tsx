"use client";

import { useState } from "react";
import { DatePickerPopover } from "@/app/components/Search/filters/DatePickerPopover";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  onConfirm: (data: { TRNS_STDT_DATE: string }) => void;
  onClose: () => void;
  messageKey?: string;
};

const toCompactDateTime = (value: string) => String(value ?? "").replace(/\D/g, "");

const pad = (value: number) => String(value).padStart(2, "0");

const toPickerValue = (value: Date) =>
  `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;

const isValidDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

const isValidTime = (value: string) => {
  if (!/^\d{2}:\d{2}:\d{2}$/.test(value)) return false;
  const [hour, minute, second] = value.split(":").map(Number);
  return hour < 24 && minute < 60 && second < 60;
};

const isValidDateTime = (value: string) => {
  const [date, time] = String(value ?? "").replace(" ", "T").split("T");
  return isValidDate(date) && isValidTime(time);
};

export default function StartWorkPopup({
  onConfirm,
  onClose,
  messageKey = "MSG_INSERT_WORK_START_DATETIME",
}: Props) {
  const [dateTime, setDateTime] = useState(() => toPickerValue(new Date()));
  const isValid = isValidDateTime(dateTime);

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      confirmLabel={Lang.get("BTN_SAVE")}
      cancelLabel={Lang.get("BTN_CANCEL")}
      isValid={isValid}
      onCancel={onClose}
      onConfirm={() =>
        onConfirm({ TRNS_STDT_DATE: toCompactDateTime(dateTime) })
      }
    >
      <p className="text-sm text-gray-700 dark:text-slate-100">
        {Lang.get(messageKey)}
      </p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-slate-100">
          {Lang.get("LBL_TRANSPORTATION_START_DATE")} / {Lang.get("LBL_TIME")} {" "}
          <span className="text-red-500">*</span>
        </label>
        <DatePickerPopover
          value={dateTime}
          onChange={setDateTime}
          size="lg"
          withTime
        />
      </div>
    </FormPopupLayout>
  );
}
