"use client";

import { useMemo, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Lang } from "@/app/services/common/Lang";

type WorkdaysHolidayPopupProps = {
  lgstGrpCd: string;
  lgstGrpNm: string;
  onConfirm: (data: {
    lgstGrpCd: string;
    lgstGrpNm: string;
    startYear: string;
    weekdays: string[];
  }) => void;
  onClose: () => void;
};

const WEEKDAY_OPTIONS = [
  { code: "1", label: Lang.get("LBL_SUN_DAY") },
  { code: "2", label: Lang.get("LBL_MON_DAY") },
  { code: "3", label: Lang.get("LBL_TUES_DAY") },
  { code: "4", label: Lang.get("LBL_WEDS_DAY") },
  { code: "5", label: Lang.get("LBL_THUR_DAY") },
  { code: "6", label: Lang.get("LBL_FRI_DAY") },
  { code: "7", label: Lang.get("LBL_SAT_DAY") },
];

const MIN_YEAR = 1900;
const MAX_YEAR = 2099;
const text = (key: string) => Lang.get(key);

export default function WorkdaysHolidayPopup({
  lgstGrpCd,
  lgstGrpNm,
  onConfirm,
  onClose,
}: WorkdaysHolidayPopupProps) {
  const [startYear, setStartYear] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const toggleDay = (dayCode: string, checked: boolean) => {
    setSelectedDays((prev) => {
      if (checked) {
        if (prev.includes(dayCode)) return prev;
        return [...prev, dayCode];
      }
      return prev.filter((day) => day !== dayCode);
    });
  };

  const handleStartYearChange = (value: string) => {
    const onlyNumber = value.replace(/[^0-9]/g, "");
    setStartYear(onlyNumber.slice(0, 4));
  };

  const isValid = useMemo(() => {
    return startYear.trim() !== "" && selectedDays.length > 0;
  }, [startYear, selectedDays]);

  const handleConfirm = () => {
    if (!isValid) return;

    const year = startYear.trim();

    if (!/^\d{4}$/.test(year)) {
      alert(text("MSG_INVALID_YEAR_FORMAT"));
      return;
    }

    const yearNumber = Number(year);

    if (yearNumber < MIN_YEAR || yearNumber > MAX_YEAR) {
      alert(`${MIN_YEAR} ~ ${MAX_YEAR} ${text("MSG_INVALID_YEAR_FORMAT")}`);
      return;
    }

    if (selectedDays.length === 0) {
      alert(text("LBL_SELECT_OFF_DAYS"));
      return;
    }

    onConfirm({
      lgstGrpCd,
      lgstGrpNm,
      startYear: year,
      weekdays: selectedDays,
    });
  };

  return (
    <div className="flex h-full w-full flex-col gap-3">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-3 p-3">
          <div className="grid grid-cols-[130px_110px_1fr] items-center gap-2">
            <label className="text-[10px] font-medium text-slate-400">
              {text("LBL_LOGISTICS_GROUP_CODE")}
            </label>

            <input
              value={lgstGrpCd}
              disabled
              className="h-8 border border-slate-200 bg-slate-50 px-2 text-[12px] text-slate-700 outline-none"
            />

            <input
              value={lgstGrpNm}
              disabled
              className="h-8 border border-slate-200 bg-slate-50 px-2 text-[12px] text-slate-700 outline-none"
            />
          </div>

          <div className="grid grid-cols-[130px_160px] items-center gap-2">
            <label className="text-[10px] font-medium text-slate-400">
              {text("LBL_START_YEAR")} <span className="text-red-500">*</span>
            </label>

            <input
              value={startYear}
              onChange={(e) => handleStartYearChange(e.target.value)}
              maxLength={4}
              placeholder="2026"
              className="h-8 border border-slate-200 bg-transparent px-2 text-[12px] text-slate-700 outline-none placeholder:text-slate-300"
            />
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-medium text-slate-400">
              {text("LBL_SELECT_OFF_DAYS")}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 px-1 py-1">
              {WEEKDAY_OPTIONS.map((day) => (
                <label
                  key={day.code}
                  className="flex items-center gap-1.5 text-[12px] text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(day.code)}
                    onChange={(e) => toggleDay(day.code, e.target.checked)}
                    className="h-3.5 w-3.5 border-slate-300"
                  />
                  <span>{day.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-2.5">
        <Button
          size="sm"
          variant="outline"
          onClick={onClose}
          className="h-7 border-slate-200 px-4 text-xs text-slate-500 hover:bg-slate-50"
        >
          {text("LBL_CLOSE")}
        </Button>

        <Button
          size="sm"
          disabled={!isValid}
          onClick={handleConfirm}
          className="h-7 bg-slate-800 px-4 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-30"
        >
          {text("BTN_SAVE")}
        </Button>
      </div>
    </div>
  );
}
