"use client";

// 자차→용차 변경 확정 팝업 (센차 DtoT/DispatchPlanVehDtoTTrckChangePop).
//  레이아웃은 DtoD(차량교환/이동) 팝업과 동일 — 선택차량(자차) ↔ 할당차량(용차) 2카드.
//  선택차량(자차): 차량번호/배송기사/차량톤급/회전수(읽기전용 view). 회전수 = 드래그한 회전 고정.
//  할당차량(용차): 드롭한 용차 행 정보(읽기전용). 착지(배송처)는 표시하지 않음. batch 1 고정.
//  → onConfirm(payload). 부모가 saveSimpleDedicatedToTempDspch 호출.

import { useMemo } from "react";
import { Truck, ArrowLeftRight } from "lucide-react";
import { Field } from "@/app/components/popup/Field";
import { Lang } from "@/app/services/common/Lang";

type Conditions = {
  DLVRY_DT?: string;
  LGST_GRP_CD?: string;
  DIV_CD?: string;
  PLN_ID?: any;
};

export type DtoTPayload = {
  ENTITY_KEY: any;
  DLVRY_DT?: string;
  LGST_GRP_CD?: string;
  DIV_CD?: string;
  PLN_ID?: any;
  IS_TRIP: any;
  RTN_NO: number;
  VEH_ID: string;
  DRVR_ID: string;
  VEH_NO: string;
  VEH_TP_CD: string;
  BATCH_NO: number;
  // 기존 차량(자차) — ORG_ 접두사로 서버 전송
  ORG_VEH_ID?: string;
  ORG_VEH_TP_CD?: string;
  ORG_DRVR_ID?: string;
  ORG_CARR_CD?: string;
  ORG_PAY_CARR_CD?: string;
};

type Props = {
  source: any; // 자차 차량행 (회전 컬럼 RTN_PATH_B1_R{n}/TRIP_KEY_B1_R{n} 보유)
  target?: any; // 드롭한 용차 배차행 (할당차량 표시용, 없으면 빈 카드)
  conditions: Conditions;
  /** 회전수 (드래그한 회전카드 번호). 미지정 시 마지막 존재 회전. */
  defaultRtn?: number;
  onConfirm: (data: DtoTPayload) => void;
  onClose: () => void;
};

// batch 1 고정 키 헬퍼 (센차 DispatchPlanVehTrckChangePopControllerAB)
const locKey = (r: number) => `RTN_PATH_B1_R${r}`;
const tripKey = (r: number) => `TRIP_KEY_B1_R${r}`;
const isTripKey = (r: number) => `IS_TRIP_RTN_B1_R${r}`;

// 차량 카드 셸 (DtoD/TtoD 팝업과 동일 양식)
function VehCard({
  title,
  accent,
  children,
}: {
  title: string;
  accent: "blue" | "green";
  children: React.ReactNode;
}) {
  const iconColor = accent === "blue" ? "text-blue-500" : "text-emerald-500";
  return (
    <div className="flex-1 min-w-0 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <Truck className={`w-4 h-4 ${iconColor}`} />
        <span className="text-[13px] font-semibold text-slate-700">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

export default function DtoTTrckChangePop({
  source,
  target,
  conditions,
  defaultRtn,
  onConfirm,
  onClose,
}: Props) {
  // 회전수 — 드래그한 회전 고정(편집 불가). 미지정 시 마지막 존재 회전으로 fallback.
  const rtn = useMemo(() => {
    if (defaultRtn != null) return Number(defaultRtn);
    for (let i = 7; i >= 1; i--) {
      const v = source?.[locKey(i)];
      if (v != null && v !== "") return i;
    }
    return 1;
  }, [defaultRtn, source]);

  const save = () =>
    onConfirm({
      ENTITY_KEY: source?.[tripKey(rtn)],
      DLVRY_DT: conditions.DLVRY_DT,
      LGST_GRP_CD: conditions.LGST_GRP_CD,
      DIV_CD: conditions.DIV_CD,
      PLN_ID: conditions.PLN_ID,
      IS_TRIP: source?.[isTripKey(rtn)],
      RTN_NO: rtn,
      VEH_TP_CD: source?.VEH_TP_CD,
      BATCH_NO: 1,
      // 기존 차량(자차) — ORG_ 접두사
      ORG_VEH_ID: source?.VEH_ID,
      ORG_VEH_TP_CD: source?.VEH_TP_CD,
      ORG_DRVR_ID: source?.DRVR_ID,
      ORG_CARR_CD: source?.CARR_CD,
      ORG_PAY_CARR_CD: source?.PAY_CARR_CD,
      //타겟차량
      VEH_ID: target?.VEH_ID,
      DRVR_ID: target?.DRVR_ID,
      VEH_NO: target?.VEH_NO,
    });

  return (
    <div className="w-full space-y-4">
      {/* 선택차량(자차) ↔ 할당차량(용차) */}
      <div className="flex items-center gap-2">
        {/* 선택차량 (자차) */}
        <VehCard title="선택차량 (자차)" accent="blue">
          <Field
            layout="horizontal"
            type="text"
            disabled
            label={Lang.get("LBL_VEH_NO")}
            value={source?.VEH_NO ?? ""}
          />
          <Field
            layout="horizontal"
            type="text"
            disabled
            label={Lang.get("LBL_DRVR_NM")}
            value={source?.DRVR_NM ?? ""}
          />
          <Field
            layout="horizontal"
            type="text"
            disabled
            label={Lang.get("LBL_VEHICLE_TYPE_NAME")}
            value={source?.VEH_TP_NM ?? source?.VEH_TP_CD ?? ""}
          />
          <Field
            layout="horizontal"
            type="text"
            disabled
            label={Lang.get("LBL_ROTATION")}
            value={`${rtn}${Lang.get("LBL_ROTATION")}`}
          />
        </VehCard>

        <div className="shrink-0 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400">
          <ArrowLeftRight className="w-4 h-4" />
        </div>

        {/* 할당차량 (용차) — 드롭한 행 정보(읽기전용) */}
        <VehCard title="할당차량 (용차)" accent="green">
          <Field
            layout="horizontal"
            type="text"
            disabled
            label={Lang.get("LBL_VEH_NO")}
            value={target?.VEH_NO ?? ""}
          />
          <Field
            layout="horizontal"
            type="text"
            disabled
            label={Lang.get("LBL_DRVR_NM")}
            value={target?.DRVR_NM ?? ""}
          />
          <Field
            layout="horizontal"
            type="text"
            disabled
            label={Lang.get("LBL_CARRIER_NAME")}
            value={target?.CARR_NM ?? ""}
          />
        </VehCard>
      </div>

      {/* 취소 / 저장 — 하단 고정 */}
      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="h-9 px-5 rounded-lg bg-slate-100 text-slate-600 text-[13px] font-medium hover:bg-slate-200 transition"
        >
          취소
        </button>
        <button
          type="button"
          onClick={save}
          className="h-9 px-5 rounded-lg bg-[rgb(var(--primary))] text-white text-[13px] font-medium hover:bg-[rgb(var(--primary-hover))] transition"
        >
          저장
        </button>
      </div>
    </div>
  );
}
