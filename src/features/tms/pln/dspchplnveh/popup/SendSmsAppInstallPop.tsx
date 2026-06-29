"use client";

// 앱설치 SMS 발송 팝업 (센차 sendsmsforappinstallpop/SendSMSPop).
//  배차번호(읽기전용) + 기사 휴대폰번호 입력 → 부모가 sendSmsForAppInstall 호출.
//  번호 형식: 01X-XXXX(XXX)-XXXX (숫자 11자리 내외).

import { useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  initialValues?: { DSPCH_NO?: string };
  onConfirm: (data: { MBL_PHN_NO: string }) => void;
  onClose: () => void;
};

const PHONE_RE = /^01\d{8,9}$/;

export default function SendSmsAppInstallPop({
  initialValues = {},
  onConfirm,
  onClose,
}: Props) {
  const [phone, setPhone] = useState("");
  const isValid = PHONE_RE.test(phone);

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      confirmLabel="발송"
      isValid={isValid}
      onCancel={onClose}
      onConfirm={() => onConfirm({ MBL_PHN_NO: phone })}
    >
      <Field
        layout="horizontal"
        type="text"
        disabled
        label={Lang.get("LBL_DISPATCH_NO")}
        value={initialValues.DSPCH_NO ?? ""}
      />
      <Field
        layout="horizontal"
        type="text"
        required
        label={Lang.get("LBL_DRIVER_TEL")}
        value={phone}
        onChange={(v) => setPhone(v.replace(/[^\d]/g, ""))}
        placeholder="'-' 없이 입력하세요"
      />
    </FormPopupLayout>
  );
}
