"use client";

// 용차→자차 변경 확정 팝업 (센차 TtoD/DispatchPlanVehTtoDTrckChangePop).
//  선택차량(용차) ↔ 할당차량(자차) 카드 + 회전수 선택 → onConfirm(payload).
//  스타일은 DtoDTrckChangePop 과 동일 양식(카드/↔/하단 버튼). 부모가 saveTempDspchToDedicatedTrck 호출.

import { useState } from "react";
import { Truck, ArrowLeftRight } from "lucide-react";
import { Field } from "@/app/components/popup/Field";
import { ComboFilter } from "@/app/components/Search/filters/ComboFilter";
import { Lang } from "@/app/services/common/Lang";

type Conditions = {
  DLVRY_DT?: string;
  LGST_GRP_CD?: string;
  DIV_CD?: string;
  PLN_ID?: any;
};

export type TtoDPayload = {
  DSPCH_NO: string;
  DLVRY_DT?: string;
  LGST_GRP_CD?: string;
  DIV_CD?: string;
  PLN_ID?: any;
  VEH_ID: string;
  DSPCH_OP_STS: string;
  DSPCH_TP: string;
  BATCH_NO: any;
  RTN_NO: number;
  TRIP_ID?: any;
  ORG_VEH_ID: string;
  ORG_VEH_NO: string;
  ORG_DRVR_ID: string;
};

type Props = {
  source: any; // 용차 배차행
  target: any; // 자차 차량행
  conditions: Conditions;
  /** 회전수 select 초기값 (드롭한 회전카드 번호 등). 미지정 시 1. */
  defaultRtn?: number;
  onConfirm: (data: TtoDPayload) => void;
  onClose: () => void;
};

const RTN_OPTS = Array.from({ length: 8 }, (_, i) => ({
  CODE: String(i + 1),
  NAME: `${i + 1}회전`,
}));

// 차량 카드 셸 (DtoDTrckChangePop 과 동일 양식)
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
        <span className="text-[13px] font-semibold text-slate-700">{title}</span>
      </div>
      {children}
    </div>
  );
}

export default function TtoDTrckChangePop({
  source,
  target,
  conditions,
  defaultRtn,
  onConfirm,
  onClose,
}: Props) {
  const [rtn, setRtn] = useState(String(defaultRtn ?? 1));

  const save = () =>
    onConfirm({
      DSPCH_NO: source.DSPCH_NO,
      DLVRY_DT: conditions.DLVRY_DT ?? source.DLVRY_DT,
      LGST_GRP_CD: conditions.LGST_GRP_CD ?? source.LGST_GRP_CD,
      DIV_CD: conditions.DIV_CD ?? source.DIV_CD,
      PLN_ID: conditions.PLN_ID ?? source.PLN_ID,
      VEH_ID: target.VEH_ID,
      DSPCH_OP_STS: source.DSPCH_OP_STS,
      DSPCH_TP: source.DSPCH_TP,
      BATCH_NO: source.BATCH_NO ?? 1,
      RTN_NO: Number(rtn),
      TRIP_ID: source.TRIP_ID,
      ORG_VEH_ID: source.VEH_ID,
      ORG_VEH_NO: source.VEH_NO,
      ORG_DRVR_ID: source.DRVR_ID,
    });

  return (
    <div className="w-full space-y-4">
      {/* 선택차량(용차) ↔ 할당차량(자차) */}
      <div className="flex items-center gap-2">
        <VehCard title="선택차량 (용차)" accent="blue">
          <Field
            layout="horizontal"
            type="text"
            disabled
            label={Lang.get("LBL_VEH_NO")}
            value={source.VEH_NO ?? ""}
          />
          <Field
            layout="horizontal"
            type="text"
            disabled
            label={Lang.get("LBL_DRVR_NM")}
            value={source.DRVR_NM ?? ""}
          />
          <Field
            layout="horizontal"
            type="text"
            disabled
            label={Lang.get("LBL_CARRIER_NAME")}
            value={source.CARR_NM ?? ""}
          />
        </VehCard>

        <div className="shrink-0 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400">
          <ArrowLeftRight className="w-4 h-4" />
        </div>

        <VehCard title="할당차량 (자차)" accent="green">
          <Field
            layout="horizontal"
            type="text"
            disabled
            label={Lang.get("LBL_VEH_NO")}
            value={target.VEH_NO ?? ""}
          />
          <Field
            layout="horizontal"
            type="text"
            disabled
            label={Lang.get("LBL_DRVR_NM")}
            value={target.DRVR_NM ?? ""}
          />
          {/* 회전수 — 흰 배경, 높이는 위 Field(h-10)와 동일 */}
          <div className="grid grid-cols-3 items-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-100">
              회전수
            </label>
            <div className="col-span-2">
              <ComboFilter
                value={rtn}
                onChange={setRtn}
                options={RTN_OPTS}
                placeholder="선택하세요"
                className="w-full"
                inputClassName="!h-10 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
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
