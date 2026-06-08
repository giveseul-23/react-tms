"use client";

// 간접비 요율 복사 팝업 (센차 OverheadTariffCopyPopup)
// 적용기간(FRM/TO)만 입력 → 부모가 선택 요율행을 copyTariffOverhead.

import { useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  onConfirm: (params: { FRM_DTTM: string; TO_DTTM: string }) => void;
  onClose: () => void;
};

const todayDash = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function OverheadTariffCopyPopup({ onConfirm, onClose }: Props) {
  const [frm, setFrm] = useState(todayDash());
  const [to, setTo] = useState(todayDash());

  const valid = !!frm && !!to && frm <= to;

  return (
    <FormPopupLayout
      cardClassName="space-y-3"
      confirmLabel={Lang.get("BTN_SAVE")}
      cancelLabel={Lang.get("BTN_CANCEL")}
      isValid={valid}
      onCancel={onClose}
      onConfirm={() =>
        onConfirm({ FRM_DTTM: frm.replace(/-/g, ""), TO_DTTM: to.replace(/-/g, "") })
      }
    >
      <div className="grid grid-cols-3 items-center gap-3">
        <label className="text-sm font-medium text-gray-700">{Lang.get("LBL_FROM_DTTM")}</label>
        <input type="date" value={frm} onChange={(e) => setFrm(e.target.value)} className="col-span-2 h-10 rounded-lg border border-gray-300 px-3 text-sm" />
      </div>
      <div className="grid grid-cols-3 items-center gap-3">
        <label className="text-sm font-medium text-gray-700">{Lang.get("LBL_TO_DTTM")}</label>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="col-span-2 h-10 rounded-lg border border-gray-300 px-3 text-sm" />
      </div>
    </FormPopupLayout>
  );
}
