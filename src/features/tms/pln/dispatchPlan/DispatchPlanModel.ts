// src/views/dispatchPlan/DispatchPlanModel.ts
import { useState } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey =
  | "main"
  | "stop"
  | "allocOrder"
  | "unallocOrder"
  | "allocSub"
  | "unallocSub"
  | "vehMgmt";

export function useDispatchPlanModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const [unallocSearching, setUnallocSearching] = useState(false);
  const [allocSearching, setAllocSearching] = useState(false);
  const [vehMgmtSearching, setVehMgmtSearching] = useState(false);
  const [vehLocPanelOpen, setVehLocPanelOpen] = useState(false);
  // 차량위치보기 대상 — 선택된 배차행 전체(다중)
  const [vehLocRows, setVehLocRows] = useState<any[]>([]);
  const [routePanelOpen, setRoutePanelOpen] = useState(false);
  // 미할당주문 탭 조회조건(카드형). 필드 키는 클라 기준 — 서버 파라미터명은 호출부에서 매핑.
  const [unallocCond, setUnallocCond] = useState<Record<string, string>>({});
  // 할당주문 탭 조회조건(카드형) — 미할당과 동일 UI, 상태는 별도 관리.
  const [allocCond, setAllocCond] = useState<Record<string, string>>({});
  // 차량정보 탭 조회조건(카드형) — 미할당과 동일 UI, 상태는 별도 관리.
  const [vehMgmtCond, setVehMgmtCond] = useState<Record<string, string>>({});
  // 탭별 조회조건 접힘 상태 — 탭 본문이 같은 트리 위치라 controlled 로 분리(전환 후에도 각자 유지).
  const [unallocCondOpen, setUnallocCondOpen] = useState(true);
  const [allocCondOpen, setAllocCondOpen] = useState(true);

  const { stores, codeMap } = useCommonStores({
    dspchOpSts: { sqlProp: "CODE", keyParam: "DSPCH_OP_STS" },
    vehOpTp: { sqlProp: "CODE", keyParam: "VEH_OP_TP" },
    loadingRateStatusList: { sqlProp: "CODE", keyParam: "LOAD_RATE_STATUS" },
    dspchOpStsList: { sqlProp: "CODE", keyParam: "DSPCH_OP_STS" },
    stopTpList: { sqlProp: "CODE", keyParam: "STOP_TP" },
    dspchTpList: { sqlProp: "CODE", keyParam: "DSPCH_TP" },
    itmUomList: { sqlProp: "CODE", keyParam: "ITEM_UOM" },
    workTp: { sqlProp: "CODE", keyParam: "WORK_DAY_TP" },
    constraintOvrdCdList: {
      sqlProp: "CODE",
      keyParam: "CONSTRAINT_OVRD_CD",
    },
    locTp: {
      sqlProp: "CODE",
      keyParam: "LOC_TP",
    },
    ordTpList: {
      sqlProp: "CODE",
      keyParam: "ORD_TP",
    },
    transTcd: {
      sqlProp: "CODE",
      keyParam: "TRANS_TCD",
    },
    vehTempTcd: {
      sqlProp: "CODE",
      keyParam: "VEH_TEMP_TCD",
    },
    vehGrpCd: {
      sqlProp: "CODE",
      keyParam: "VEH_GRP_CD",
    },
    vehDspchTp: {
      sqlProp: "CODE",
      keyParam: "VEH_DISPATCH_TP",
    },
    dlvryTpList: {
      sqlProp: "CODE",
      keyParam: "HARIM_ORD_DLV_TP_CD",
    },
    pboxTpList: [
      { CODE: "PBOX", NAME: "P박스" },
      { CODE: "NOPBOX", NAME: "비P박스" },
    ],
  });

  return {
    ...base,
    unallocSearching,
    setUnallocSearching,
    allocSearching,
    setAllocSearching,
    vehMgmtSearching,
    setVehMgmtSearching,
    vehLocPanelOpen,
    setVehLocPanelOpen,
    vehLocRows,
    setVehLocRows,
    routePanelOpen,
    setRoutePanelOpen,
    unallocCond,
    setUnallocCond,
    allocCond,
    setAllocCond,
    vehMgmtCond,
    setVehMgmtCond,
    unallocCondOpen,
    setUnallocCondOpen,
    allocCondOpen,
    setAllocCondOpen,
    stores,
    codeMap,
  };
}

export type DispatchPlanModel = ReturnType<typeof useDispatchPlanModel>;
