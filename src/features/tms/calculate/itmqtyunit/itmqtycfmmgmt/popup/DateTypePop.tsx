"use client";

// 일자유형 선택 팝업 (서버 pop/DateTypePop 대응)
// 배송일/입고일/출고일 중 하나 선택 + From/To 기간 → 부모 Controller 가
// onDateItemQtyConfirm(Cancel) 호출. 전달 payload: DATE_TP / FRM_DTTM / TO_DTTM (+ 검색 스코프).

import { useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { DatePickerPopover } from "@/app/components/Search/filters/DatePickerPopover";
import { Lang } from "@/app/services/common/Lang";

type DateTp = "DLVRY_DT" | "INBND_DT" | "OTBND_DT";

type Props = {
  initialValues?: {
    DIV_CD?: string;
    LGST_GRP_CD?: string;
    ITEMQTY_OP_STS?: string;
  };
  onConfirm: (data: {
    DIV_CD: string;
    LGST_GRP_CD: string;
    ITEMQTY_OP_STS: string;
    FRM_DTTM: string;
    TO_DTTM: string;
    DATE_TP: DateTp;
  }) => void;
  onClose: () => void;
};

const DATE_TP_LABELS: { value: DateTp; labelKey: string }[] = [
  { value: "DLVRY_DT", labelKey: "LBL_DLVRY_DATE" },
  { value: "INBND_DT", labelKey: "LBL_INBND_DT" },
  { value: "OTBND_DT", labelKey: "LBL_OTBND_DT" },
];

// "YYYY-MM-DD" 정규화
const toDash = (v: string) => {
  const d = String(v ?? "").replace(/-/g, "");
  if (d.length < 8) return v;
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
};

export function DateTypePop({ initialValues = {}, onConfirm, onClose }: Props) {
  const [dateTp, setDateTp] = useState<DateTp>("DLVRY_DT");
  const [frm, setFrm] = useState("");
  const [to, setTo] = useState("");

  // 필수 + 시작일 <= 종료일 (서버 MSG_DATE_SEQ_CHK 검증 대응)
  const isValid = !!(frm && to) && frm <= to;

  const handleConfirm = () => {
    onConfirm({
      DIV_CD: initialValues.DIV_CD ?? "",
      LGST_GRP_CD: initialValues.LGST_GRP_CD ?? "",
      ITEMQTY_OP_STS: initialValues.ITEMQTY_OP_STS ?? "",
      FRM_DTTM: toDash(frm),
      TO_DTTM: toDash(to),
      DATE_TP: dateTp,
    });
  };

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      confirmLabel={Lang.get("BTN_APPLY")}
      isValid={isValid}
      onCancel={onClose}
      onConfirm={handleConfirm}
    >
      <div className="flex gap-4">
        {DATE_TP_LABELS.map((t) => (
          <label key={t.value} className="flex items-center gap-1 text-sm">
            <input
              type="radio"
              name="dateTp"
              checked={dateTp === t.value}
              onChange={() => setDateTp(t.value)}
            />
            {Lang.get(t.labelKey)}
          </label>
        ))}
      </div>
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
    </FormPopupLayout>
  );
}
