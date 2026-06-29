import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// main: 주문단위(LBL_ORDER_UOM) / sub01: 품목단위(LBL_ITEM_UOM)
export type GridKey = "main" | "sub01";

export function useCostDistributionModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 (서버 CostDistributionModel stores 대응)
  const { codeMap } = useCommonStores({
    cstDistSts: { sqlProp: "CODE", keyParam: "CST_DIST_STS" },
    cstDistApTp: { sqlProp: "CODE", keyParam: "CST_DIST_AP_TP" },
    cstDistDataTcd: { sqlProp: "CODE", keyParam: "CST_DIST_DATA_TCD" },
    shpmTpList: { sqlProp: "CODE", keyParam: "SHPM_TP" },
    cstCntrCdList: { sqlProp: "CODE", keyParam: "CST_CNTR_CD" },
    gnrlLdgrCd: { sqlProp: "CODE", keyParam: "GNRL_LDGR_CD" },
  });

  return { ...base, codeMap };
}

export type CostDistributionModel = ReturnType<typeof useCostDistributionModel>;
