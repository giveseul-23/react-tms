"use client";

// 임시차량(스팟차량) 등록 팝업 — 선택 용차 배차행에 임시 차량번호/운전자명 등록.
// 서버 pop/regspot/RegiSpotPop 대응.
//   차량유형명·운송사명 표시(읽기전용) + 차량번호·운전자명 입력 → 부모가 saveDspchSpotVeh 호출.

import { useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";
import { Lang } from "@/app/services/common/Lang";

type Patch = { VEH_NO: string; DRVR_NM: string };

type Props = {
  initialValues: Record<string, any>;
  onConfirm: (patch: Patch) => void;
  onClose: () => void;
};

export default function RegiSpotPop({
  initialValues,
  onConfirm,
  onClose,
}: Props) {
  const [vehNo, setVehNo] = useState(initialValues.VEH_NO ?? "");
  const [drvrNm, setDrvrNm] = useState(initialValues.DRVR_NM ?? "");

  const isValid = vehNo.trim() !== "" && drvrNm.trim() !== "";

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      confirmLabel="저장"
      isValid={isValid}
      onCancel={onClose}
      onConfirm={() => onConfirm({ VEH_NO: vehNo, DRVR_NM: drvrNm })}
    >
      <Field
        layout="horizontal"
        type="text"
        disabled
        label={Lang.get("LBL_VEHICLE_TYPE_NAME")}
        value={initialValues.VEH_TP_NM ?? ""}
      />
      <Field
        layout="horizontal"
        type="text"
        disabled
        label={Lang.get("LBL_CARRIER_NAME")}
        value={initialValues.CARR_NM ?? ""}
      />
      <Field
        layout="horizontal"
        type="text"
        required
        label={Lang.get("LBL_VEH_NO")}
        value={vehNo}
        onChange={setVehNo}
      />
      <Field
        layout="horizontal"
        type="text"
        required
        label={Lang.get("LBL_DRIVER_NAME")}
        value={drvrNm}
        onChange={setDrvrNm}
      />
    </FormPopupLayout>
  );
}
