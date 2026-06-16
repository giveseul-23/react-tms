import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// main: 운송주문 / sub01: 비용계산식 / sub02: 비용조건
export type GridKey = "main" | "sub01" | "sub02";

export function useOrderMonitorModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 (서버 OrderMonitorModel stores 대응 — 전부 module TMS)
  const { codeMap } = useCommonStores({
    payTypeList: { sqlProp: "CODE", keyParam: "AP_PROC_TP" },
    dspchStatusList: { sqlProp: "CODE", keyParam: "DSPCH_OP_STS" },
    orgShpmOpStsList: { sqlProp: "CODE", keyParam: "ORG_SHPM_OP_STS" },
    shpmOpStsList: { sqlProp: "CODE", keyParam: "SHPM_OP_STS" },
    apFiStsList: { sqlProp: "CODE", keyParam: "AP_FI_STS" },
    ordTpList: { sqlProp: "CODE", keyParam: "ORD_TP" },
  });

  return { ...base, codeMap };
}

export type OrderMonitorModel = ReturnType<typeof useOrderMonitorModel>;
