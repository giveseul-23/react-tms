import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "costDetail" | "waypoint";

export function useDispatchManagerCostModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { defaultLayout: "vertical" });

  const { codeMap } = useCommonStores({
    apType: { sqlProp: "CODE", keyParam: "TM_LEGARCY_AP_TP" },
    financialStatus: { sqlProp: "CODE", keyParam: "AP_FI_STS" },
    serviceType: { sqlProp: "CODE", keyParam: "TRF_SVC_TP" },
    pickDropDiv: { sqlProp: "CODE", keyParam: "STOP_TP" },
  });

  return { ...base, codeMap };
}

export type DispatchManagerCostModel = ReturnType<
  typeof useDispatchManagerCostModel
>;
