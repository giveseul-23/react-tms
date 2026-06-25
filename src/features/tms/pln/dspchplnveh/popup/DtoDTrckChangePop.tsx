"use client";

// 자차↔자차 차량교환/이동 팝업 (센차 DtoD/DispatchPlanVehDtoDTrckChangePop, 디자인 개선안 반영).
//  선택차량 정보(좌) ↔ 할당차량 정보(우) 카드 + 변경유형(배송차량 교환 / 배송일정 이동) 선택.
//  차량번호·배송기사·차량톤급·비고사항은 disabled(표준 스타일), 회전수만 콤보 편집.
//  → onConfirm(payload). 부모가 api.dedicatedTrckChange 호출. 취소/저장은 하단 고정.

import { useState } from "react";
import { Truck, ArrowLeftRight, Box, Info } from "lucide-react";
import { Field } from "@/app/components/popup/Field";
import { ComboFilter } from "@/app/components/Search/filters/ComboFilter";

type Conditions = { DLVRY_DT?: string; LGST_GRP_CD?: string; PLN_ID?: any };

type ChangeType = "CHANGE_LOAD" | "CHANGE_SHIPMENT";

export type DtoDPayload = {
  CHANGE_TYPE: ChangeType;
  DLVRY_DT?: string;
  LGST_GRP_CD?: string;
  PLN_ID?: any;
  SRC_VEH_ID: string;
  SRC_BATCH_NO: any;
  SRC_RTN_NO: number;
  TRG_VEH_ID: string;
  TRG_BATCH_NO: any;
  TRG_RTN_NO: number;
};

type Props = {
  source: any;
  target: any;
  conditions: Conditions;
  onConfirm: (data: DtoDPayload) => void;
  onClose: () => void;
};

// 회전수 전체(1~8) — 할당차량(우) 에서 사용
const ALL_ROTATIONS = Array.from({ length: 8 }, (_, i) => ({
  CODE: String(i + 1),
  NAME: `${i + 1}회전`,
}));

// 차량 행의 회전별 배차 경로(RTN_PATH_B1_Rn)가 존재하는 회전만 선택 옵션으로 노출.
// (예: 2회전부터 배차가 있으면 2~ 회전만 선택 가능) — 선택차량(좌) 에서 사용
const availableRotations = (veh: any) =>
  Array.from({ length: 8 }, (_, i) => i + 1)
    .filter((n) => {
      const v = veh?.[`RTN_PATH_B1_R${n}`];
      return v != null && String(v).trim() !== "";
    })
    .map((n) => ({ CODE: String(n), NAME: `${n}회전` }));

// 차량 카드 (신규/현재)
function VehCard({
  title,
  accent,
  veh,
  rtn,
  onRtn,
  rtnOpts,
}: {
  title: string;
  accent: "blue" | "green";
  veh: any;
  rtn: string;
  onRtn: (v: string) => void;
  rtnOpts: { CODE: string; NAME: string }[];
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
      <Field
        layout="horizontal"
        type="text"
        disabled
        label="차량번호"
        value={veh.VEH_NO ?? ""}
      />
      <Field
        layout="horizontal"
        type="text"
        disabled
        label="배송기사"
        value={veh.DRVR_NM ?? ""}
      />
      <Field
        layout="horizontal"
        type="text"
        disabled
        label="차량톤급"
        value={veh.VEH_TP_NM ?? ""}
      />
      {/* 회전수 — 배차(RTN_PATH)가 있는 회전만 선택. 흰 배경, 높이는 위아래 Field(h-10)와 동일 */}
      <div className="grid grid-cols-3 items-center gap-3">
        <label className="text-sm font-medium text-gray-700 dark:text-slate-100">
          회전수
        </label>
        <div className="col-span-2">
          {rtnOpts.length > 0 ? (
            <ComboFilter
              value={rtn}
              onChange={onRtn}
              options={rtnOpts}
              placeholder="선택하세요"
              className="w-full"
              inputClassName="!h-10 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:ring-2 focus:ring-blue-400"
            />
          ) : (
            <div className="h-10 flex items-center text-[12px] text-red-500">
              배차된 회전이 없습니다.
            </div>
          )}
        </div>
      </div>
      <Field
        layout="horizontal"
        type="text"
        disabled
        label="비고사항"
        value={veh.MEMO ?? ""}
      />
    </div>
  );
}

// 변경유형 선택 카드
function TypeCard({
  selected,
  icon,
  title,
  desc,
  onClick,
}: {
  selected: boolean;
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
        selected
          ? "border-[rgb(var(--primary))] bg-[var(--grid-header-bg)]"
          : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      <div
        className={`mt-0.5 ${selected ? "text-[rgb(var(--primary))]" : "text-slate-400"}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-slate-700">{title}</div>
        <div className="text-[12px] text-slate-400 mt-0.5">{desc}</div>
      </div>
    </button>
  );
}

export default function DtoDTrckChangePop({
  source,
  target,
  conditions,
  onConfirm,
  onClose,
}: Props) {
  // 선택차량(좌): 배차된 회전만 / 할당차량(우): 회전수 전체 노출
  const srcOpts = availableRotations(source);
  const trgOpts = ALL_ROTATIONS;
  // 선택차량에 배차된 회전이 하나도 없으면 교환 불가
  const hasError = srcOpts.length === 0;

  const [changeType, setChangeType] = useState<ChangeType>("CHANGE_LOAD");
  const [srcRtn, setSrcRtn] = useState(() => srcOpts[0]?.CODE ?? "");
  const [trgRtn, setTrgRtn] = useState(() => trgOpts[0]?.CODE ?? "");

  const save = () => {
    if (hasError) return;
    onConfirm({
      CHANGE_TYPE: changeType,
      DLVRY_DT: conditions.DLVRY_DT,
      LGST_GRP_CD: conditions.LGST_GRP_CD,
      PLN_ID: conditions.PLN_ID,
      SRC_VEH_ID: source.VEH_ID,
      SRC_BATCH_NO: source.BATCH_NO ?? 1,
      SRC_RTN_NO: Number(srcRtn),
      TRG_VEH_ID: target.VEH_ID,
      TRG_BATCH_NO: target.BATCH_NO ?? 1,
      TRG_RTN_NO: Number(trgRtn),
    });
  };

  return (
    <div className="w-full space-y-4">
      {/* 배차된 회전이 없는 차량 선택 시 에러 */}
      {hasError && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 text-[12px] text-red-600">
          <Info className="w-4 h-4 shrink-0" />
          <span>선택한 차량에 배차된 회전이 없어 교환/이동할 수 없습니다.</span>
        </div>
      )}

      {/* 선택차량 ↔ 할당차량 */}
      <div className="flex items-center gap-2">
        <VehCard
          title="선택차량 정보"
          accent="blue"
          veh={source}
          rtn={srcRtn}
          onRtn={setSrcRtn}
          rtnOpts={srcOpts}
        />
        <div className="shrink-0 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400">
          <ArrowLeftRight className="w-4 h-4" />
        </div>
        <VehCard
          title="할당차량 정보"
          accent="green"
          veh={target}
          rtn={trgRtn}
          onRtn={setTrgRtn}
          rtnOpts={trgOpts}
        />
      </div>

      {/* 변경유형 선택 */}
      <div className="space-y-2">
        <div className="text-[13px] font-semibold text-slate-600">
          변경유형 선택
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TypeCard
            selected={changeType === "CHANGE_LOAD"}
            icon={<Truck className="w-5 h-5" />}
            title="배송차량 교환"
            desc="신규 차량으로 교체합니다."
            onClick={() => setChangeType("CHANGE_LOAD")}
          />
          <TypeCard
            selected={changeType === "CHANGE_SHIPMENT"}
            icon={<Box className="w-5 h-5" />}
            title="배송물량 이동"
            desc="배송 물량만 이동합니다."
            onClick={() => setChangeType("CHANGE_SHIPMENT")}
          />
        </div>
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
          disabled={hasError}
          className="h-9 px-5 rounded-lg bg-[rgb(var(--primary))] text-white text-[13px] font-medium hover:bg-[rgb(var(--primary-hover))] disabled:opacity-40 transition"
        >
          저장
        </button>
      </div>
    </div>
  );
}
