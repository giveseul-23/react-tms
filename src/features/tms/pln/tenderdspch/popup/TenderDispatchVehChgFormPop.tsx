"use client";

import { useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";
import { Lang } from "@/app/services/lang/lang";

// 센차 TenderDispatchVehChgFormPop — 임시(spot) 차량 번호/운전자 편집 후 확정.
// AP_PROC_TP != '20' 인 차량 선택 시 VehChgPop 의 onSave 에서 이 팝업을 띄운다.
type Props = {
  // VehChgPop 에서 선택한 차량 행(코드/명 + 숨김 키)
  initialValues: Record<string, any>;
  onConfirm: (data: Record<string, any>) => void;
  onClose: () => void;
};

export default function TenderDispatchVehChgFormPop({
  initialValues,
  onConfirm,
  onClose,
}: Props) {
  const [vehNo, setVehNo] = useState(initialValues.VEH_NO ?? "");
  const [drvrNm, setDrvrNm] = useState(initialValues.DRVR_NM ?? "");

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      confirmLabel={Lang.get("BTN_SAVE")}
      onCancel={onClose}
      onConfirm={() =>
        onConfirm({
          DIV_CD: initialValues.DIV_CD,
          LGST_GRP_CD: initialValues.LGST_GRP_CD,
          CARR_CD: initialValues.CARR_CD,
          AP_PROC_TP: initialValues.AP_PROC_TP,
          VEH_TP_CD: initialValues.VEH_TP_CD,
          VEH_ID: initialValues.VEH_ID,
          VEH_NO: vehNo,
          DRVR_NM: drvrNm,
        })
      }
    >
      <Field
        layout="horizontal"
        type="text"
        disabled
        label="LBL_VEHICLE_TYPE_NAME"
        value={initialValues.VEH_TP_NM ?? ""}
      />
      <Field
        layout="horizontal"
        type="text"
        label="LBL_VEH_NO"
        value={vehNo}
        onChange={setVehNo}
      />
      <Field
        layout="horizontal"
        type="text"
        label="LBL_DRIVER_NAME"
        value={drvrNm}
        onChange={setDrvrNm}
      />
    </FormPopupLayout>
  );
}
