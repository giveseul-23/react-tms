// src/features/tms/pln/crfmdspch/ConfirmDispatchModel.ts
//
// useBaseModel + 화면 고유 codeMap (공통코드 lookup).

import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// 5 그리드
//   config         : master (탭 위)
//   order          : 주문 탭 (master 클릭 시 fetch)
//   receipt        : POD 탭 (master 클릭 시 fetch)
//   receiptHistory : POD 발행 이력 탭 (master 클릭 시 fetch)
//   orderItem      : 주문 상세 (order 클릭 시 fetch)
export type GridKey =
  | "config"
  | "order"
  | "receipt"
  | "receiptHistory"
  | "orderItem";

export function useConfirmDispatchModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { defaultLayout: "vertical" });

  const { stores } = useCommonStores({
    dspchOpSts: { sqlProp: "CODE", keyParam: "DSPCH_OP_STS" },
    stopTp: { sqlProp: "CODE", keyParam: "STOP_TP" },
    shpmOpSts: { sqlProp: "CODE", keyParam: "SHPM_OP_STS" },
    itmUom: { sqlProp: "CODE", keyParam: "ITM_UOM" },
    podTcd: { sqlProp: "CODE", keyParam: "POD_TCD" },
    podOpSts: { sqlProp: "CODE", keyParam: "POD_OP_STS" },
    dspchPodOpSts: { sqlProp: "CODE", keyParam: "DSPCH_POD_OP_STS" },
    podLogEvntCd: { sqlProp: "CODE", keyParam: "POD_LOG_EVNT_CD" },
    vehOpType: { sqlProp: "CODE", keyParam: "VEH_OP_TP" },
    invSys: { sqlProp: "CODE", keyParam: "HARIM_INV_SYS_ID" },
  });

  const codeMap = useMemo(() => {
    const map: Record<string, Record<string, string>> = {};
    Object.entries(stores).forEach(([storeKey, items]) => {
      map[storeKey] = {};
      (items ?? []).forEach((item: any) => {
        map[storeKey][item.CODE] = item.NAME;
      });
    });
    return map;
  }, [stores]);

  return { ...base, codeMap };
}

export type ConfirmDispatchModel = ReturnType<typeof useConfirmDispatchModel>;
