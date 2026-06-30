"use client";

// 기간구분 변경 팝업 (서버 pop/TermTpPop 대응)
// From/To 운송일 + 기간구분(TERM_TP) 입력 → 부모 Controller 가 saveTermTp 호출.

import { useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";
import { DatePickerPopover } from "@/app/components/Search/filters/DatePickerPopover";
import { showInfoModal } from "@/app/components/popup/showInfoModal";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  initialValues?: { FRM_DTTM?: string; TO_DTTM?: string };
  termTpOptions: { CODE: string; NAME: string }[];
  onConfirm: (data: { FRM_DTTM: string; TO_DTTM: string; TERM_TP: string }) => void;
  onClose: () => void;
};

const toYmd = (v: string) => String(v ?? "").replace(/\D/g, "").slice(0, 8);

const toDash = (v: string) => {
  const d = toYmd(v);
  if (d.length < 8) return String(v ?? "");
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
};

export function TermTpPop({
  initialValues = {},
  termTpOptions,
  onConfirm,
  onClose,
}: Props) {
  const [frm, setFrm] = useState(toDash(initialValues.FRM_DTTM ?? ""));
  const [to, setTo] = useState(toDash(initialValues.TO_DTTM ?? ""));
  const [termTp, setTermTp] = useState("10"); // 서버 기본값 '10'

  const isValid = !!(frm && to && termTp);

  const handleConfirm = () => {
    const frmYmd = toYmd(frm);
    const toYmdVal = toYmd(to);

    if (!frmYmd) {
      showInfoModal(
        Lang.get("MSG_VALID_REQ", Lang.get("LBL_FROM_DTTM")),
        Lang.get("TTL_CONFIRM"),
      );
      return;
    }
    if (!toYmdVal) {
      showInfoModal(
        Lang.get("MSG_VALID_REQ", Lang.get("LBL_TO_DTTM")),
        Lang.get("TTL_CONFIRM"),
      );
      return;
    }
    if (!termTp) {
      showInfoModal(
        Lang.get("MSG_VALID_REQ", Lang.get("LBL_TERM_TP")),
        Lang.get("TTL_CONFIRM"),
      );
      return;
    }
    if (frmYmd > toYmdVal) {
      showInfoModal(
        Lang.get("MSG_INPUT_DATE_VALIDATION"),
        Lang.get("TTL_ERR"),
      );
      return;
    }

    onConfirm({
      FRM_DTTM: frmYmd,
      TO_DTTM: toYmdVal,
      TERM_TP: termTp,
    });
  };

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      confirmLabel={Lang.get("BTN_SAVE")}
      isValid={isValid}
      onCancel={onClose}
      onConfirm={handleConfirm}
    >
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
      <Field
        layout="vertical"
        type="combo"
        label={Lang.get("LBL_TERM_TP")}
        value={termTp}
        onChange={setTermTp}
        options={termTpOptions}
      />
    </FormPopupLayout>
  );
};
