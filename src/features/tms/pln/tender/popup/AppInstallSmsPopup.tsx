"use client";

import { useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";
import { Lang } from "@/app/services/common/Lang";

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

  const isValid = phone.length > 10 && phone.length < 16;

  return (
    <FormPopupLayout
      cancelLabel={Lang.get("BTN_CANCEL")}
      confirmLabel={Lang.get("BTN_SEND")}
      isValid={isValid}
      onCancel={onClose}
      onConfirm={() => onConfirm({ phone })}
    >
      <Field
        layout="horizontal"
        type="text"
        label={Lang.get("LBL_TEL_NO")}
        required
        value={phone}
        onChange={(v) => setPhone(onlyNumber(v))}
        placeholder='"-" 없이 숫자만 입력'
      />
    </FormPopupLayout>
  );
}
