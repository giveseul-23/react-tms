"use client";

// 연락처(전화번호) 변경 팝업 (센차 PhoneNumberChgPop)
// 선택 차량 1건의 운전자 휴대폰번호를 변경. 신규 번호만 입력받아 부모에 전달.

import { useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  row: any;
  onConfirm: (newMblPhnNo: string) => void;
  onClose: () => void;
};

export default function PhoneNumberChgPop({ row, onConfirm, onClose }: Props) {
  const [phone, setPhone] = useState("");

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      confirmLabel={Lang.get("BTN_SAVE")}
      cancelLabel={Lang.get("BTN_CANCEL")}
      isValid={!!phone}
      onCancel={onClose}
      onConfirm={() => onConfirm(phone)}
    >
      <Field
        layout="horizontal"
        type="text"
        disabled
        label={Lang.get("LBL_VEHICLE_CODE")}
        value={row?.VEH_ID ?? ""}
      />
      <Field
        layout="horizontal"
        type="text"
        disabled
        label={Lang.get("LBL_VEH_NO")}
        value={row?.VEH_NO ?? ""}
      />
      <Field
        layout="horizontal"
        type="text"
        disabled
        label={Lang.get("LBL_DRIVER_NAME")}
        value={row?.DRVR_NM ?? ""}
      />
      <Field
        layout="horizontal"
        type="text"
        required
        label={Lang.get("LBL_NEW_HP_NO")}
        value={phone}
        onChange={(v) => setPhone(v.replace(/[^0-9]/g, ""))}
      />
    </FormPopupLayout>
  );
}
