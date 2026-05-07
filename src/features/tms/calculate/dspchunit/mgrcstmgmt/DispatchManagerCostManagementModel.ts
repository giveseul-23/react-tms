import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "costDetail" | "waypoint";

export function useDispatchManagerCostModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { defaultLayout: "vertical" });

  const { stores } = useCommonStores({
    apType: { sqlProp: "CODE", keyParam: "TM_LEGARCY_AP_TP" },
    financialStatus: { sqlProp: "CODE", keyParam: "AP_FI_STS" },
    serviceType: { sqlProp: "CODE", keyParam: "TRF_SVC_TP" },
    pickDropDiv: { sqlProp: "CODE", keyParam: "STOP_TP" },
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

export type DispatchManagerCostModel = ReturnType<
  typeof useDispatchManagerCostModel
>;
