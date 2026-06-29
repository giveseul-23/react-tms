"use client";

// 임시차량변경(스팟차량 등록) 팝업 — 선택 배차행에 임시 차량/기사/연락처를 등록.
// 서버 dspchplnveh.pop.regspot.RegiSpotPop 대응.
//   차량유형명·운송사명 표시(읽기전용), 차량번호·운전자명·기사연락처 입력.
//   부모가 /dispatchPlanVehService/saveDspchSpotVeh 호출.

import { useMemo, useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";
import { Lang } from "@/app/services/common/Lang";

type Patch = {
  VEH_NO: string;
  DRVR_NM: string;
  MBL_PHN_NO: string;
  VEH_TP_CD: string;
};

type Props = {
  // 선택 배차행 (VEH_TP_NM / CARR_NM / VEH_NO / DRVR_NM / VEH_TP_CD / DIV_CD …)
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
  const [mblPhnNo, setMblPhnNo] = useState("");

  const isAc = initialValues.DIV_CD === "AC";
  const isValid = useMemo(() => {
    if (!/^010\d{8}$/.test(mblPhnNo)) return false; // 연락처 필수 + 형식
    if (isAc) return true; // AC 부서는 차량번호/운전자명 검증 생략
    return vehNo.trim() !== "" && drvrNm.trim().length >= 2;
  }, [mblPhnNo, isAc, vehNo, drvrNm]);

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      confirmLabel="확인"
      isValid={isValid}
      onCancel={onClose}
      onConfirm={() =>
        onConfirm({
          VEH_NO: vehNo,
          DRVR_NM: drvrNm,
          MBL_PHN_NO: mblPhnNo,
          VEH_TP_CD: initialValues.VEH_TP_CD ?? "",
        })
      }
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
      <Field
        layout="horizontal"
        type="text"
        required
        label={Lang.get("LBL_DRIVER_TEL")}
        value={mblPhnNo}
        onChange={(v: string) => setMblPhnNo(v.replace(/[^0-9]/g, ""))}
        placeholder="'-' 없이 입력 (010********)"
      />
    </FormPopupLayout>
  );
}
