"use client";

import { useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";

type TemporaryVehicleChangeContentProps = {
  defaultVehicleType?: string;
  defaultCarrierName?: string;
  onConfirm: (data: {
    VEH_NO: string;
    DRVR_NM: string;
    MBL_PHN_NO: string;
  }) => void;
  onClose: () => void;
  initialValues?: Record<string, any>;
};

export default function TemporaryVehicleChangePopup({
  onConfirm,
  onClose,
  initialValues = {},
}: TemporaryVehicleChangeContentProps) {
  const [vehicleType] = useState(initialValues.VEH_TP_CD ?? "");
  const [carrierName] = useState(initialValues.CARR_NM ?? "");
  const [vehicleNo, setVehicleNo] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");

  const isValid = !!(vehicleNo && driverName && driverPhone);

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      confirmLabel="저장"
      isValid={isValid}
      onCancel={onClose}
      onConfirm={() =>
        onConfirm({
          VEH_NO: vehicleNo,
          DRVR_NM: driverName,
          MBL_PHN_NO: driverPhone,
        })
      }
    >
      <Field
        layout="horizontal"
        type="text"
        disabled
        label="차량유형명"
        value={vehicleType}
      />

      <Field
        layout="horizontal"
        type="text"
        disabled
        label="운송협력사명"
        value={carrierName}
      />

      <Field
        layout="horizontal"
        type="text"
        label="차량번호"
        value={vehicleNo}
        onChange={setVehicleNo}
      />

      <Field
        layout="horizontal"
        type="text"
        label="운전자명"
        value={driverName}
        onChange={setDriverName}
      />

      <Field
        layout="horizontal"
        type="text"
        label="운전자전화번호"
        value={driverPhone}
        onChange={setDriverPhone}
        placeholder='"-" 를 빼고 작성하세요.'
      />
    </FormPopupLayout>
  );
}
