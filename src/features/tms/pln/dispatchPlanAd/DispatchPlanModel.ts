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
  const [vehMgmtSearching, setVehMgmtSearching] = useState(false);
  const [vehLocPanelOpen, setVehLocPanelOpen] = useState(false);
  const [routePanelOpen, setRoutePanelOpen] = useState(false);
  // 미할당주문 탭 조회조건(카드형). 필드 키는 클라 기준 — 서버 파라미터명은 호출부에서 매핑.
  const [unallocCond, setUnallocCond] = useState<Record<string, string>>({});

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
    vehMgmtSearching,
    setVehMgmtSearching,
    vehLocPanelOpen,
    setVehLocPanelOpen,
    routePanelOpen,
    setRoutePanelOpen,
    unallocCond,
    setUnallocCond,
    stores,
    codeMap,
  };
}

export type DispatchPlanModel = ReturnType<typeof useDispatchPlanModel>;
