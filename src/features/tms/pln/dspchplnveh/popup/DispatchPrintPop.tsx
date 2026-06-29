"use client";

// 배차표 출력 팝업 — 출력유형(차량별/착지별) + 출력대상(1배치/2배치/종합) 선택.
// 서버 pop/ozReport/DispatchPlanVehDispatchPrintPop 대응.
//   확인 시 부모가 PRINT_TYPE/PRINT_RANGE 로 OZ 리포트를 호출(OZ 연동은 미구현 TODO).

import { useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  onConfirm: (data: { PRINT_TYPE: "veh" | "loc"; PRINT_RANGE: string }) => void;
  onClose: () => void;
};

const TYPE_OPTS: { value: "veh" | "loc"; labelKey: string }[] = [
  { value: "veh", labelKey: "LBL_BY_VEH" },
  { value: "loc", labelKey: "LBL_BY_LOC" },
];
const RANGE_OPTS: { value: string; labelKey: string }[] = [
  { value: "1배치", labelKey: "LBL_BATCH1" },
  { value: "2배치", labelKey: "LBL_BATCH2" },
  { value: "종합", labelKey: "LBL_OVERALL" },
];

export default function DispatchPrintPop({ onConfirm, onClose }: Props) {
  const [printType, setPrintType] = useState<"veh" | "loc">("veh");
  const [printRange, setPrintRange] = useState("1배치");

  return (
    <FormPopupLayout
      cardClassName="space-y-5"
      confirmLabel="출력"
      isValid
      onCancel={onClose}
      onConfirm={() => onConfirm({ PRINT_TYPE: printType, PRINT_RANGE: printRange })}
    >
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700 dark:text-slate-100">
          {Lang.get("LBL_DISPATCH_REPORT_TYPE")}
        </div>
        <div className="flex gap-4">
          {TYPE_OPTS.map((o) => (
            <label key={o.value} className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                name="printType"
                checked={printType === o.value}
                onChange={() => setPrintType(o.value)}
              />
              {Lang.get(o.labelKey)}
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700 dark:text-slate-100">
          {Lang.get("LBL_PRINT_TARGET")}
        </div>
        <div className="flex gap-4">
          {RANGE_OPTS.map((o) => (
            <label key={o.value} className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                name="printRange"
                checked={printRange === o.value}
                onChange={() => setPrintRange(o.value)}
              />
              {Lang.get(o.labelKey)}
            </label>
          ))}
        </div>
      </div>
    </FormPopupLayout>
  );
}
