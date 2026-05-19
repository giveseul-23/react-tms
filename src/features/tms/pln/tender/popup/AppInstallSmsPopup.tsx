"use client";

import { useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";

type AppInstallSmsContentProps = {
  defaultPhone?: string;
  onConfirm: (data: { phone: string }) => void;
  onClose: () => void;
};

export default function AppInstallSmsPopup({
  defaultPhone = "",
  onConfirm,
  onClose,
}: AppInstallSmsContentProps) {
  const [phone, setPhone] = useState(defaultPhone);

  const onlyNumber = (value: string) => value.replace(/[^0-9]/g, "");

  const isValid = phone.length >= 10; // 기본 유효성 (10~11자리 가정)

  return (
    <FormPopupLayout
      confirmLabel="전송"
      isValid={isValid}
      onCancel={onClose}
      onConfirm={() => onConfirm({ phone })}
    >
      <Field
        layout="horizontal"
        type="text"
        label="전화번호"
        required
        value={phone}
        onChange={(v) => setPhone(onlyNumber(v))}
        placeholder='"-" 없이 숫자만 입력'
      />
    </FormPopupLayout>
  );
}
