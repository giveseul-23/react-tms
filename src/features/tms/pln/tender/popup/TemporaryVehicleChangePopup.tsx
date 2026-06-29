"use client";

import { useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";
import { Lang } from "@/app/services/common/Lang";

type TemporaryVehicleChangeContentProps = {
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
      cancelLabel={Lang.get("BTN_CANCEL")}
      confirmLabel={Lang.get("BTN_SAVE")}
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
        label={Lang.get("LBL_VEHICLE_TYPE_NAME")}
        value={vehicleType}
      />

      <Field
        layout="horizontal"
        type="text"
        disabled
        label={Lang.get("LBL_CARRIER_NAME")}
        value={carrierName}
      />

      <Field
        layout="horizontal"
        type="text"
        label={Lang.get("LBL_VEH_NO")}
        value={vehicleNo}
        onChange={setVehicleNo}
      />

      <Field
        layout="horizontal"
        type="text"
        label={Lang.get("LBL_DRIVER_NAME")}
        value={driverName}
        onChange={setDriverName}
      />

      <Field
        layout="horizontal"
        type="text"
        label={Lang.get("LBL_DRIVER_TEL")}
        value={driverPhone}
        onChange={setDriverPhone}
        placeholder='"-" 를 빼고 작성하세요.'
      />
    </FormPopupLayout>
  );
}
