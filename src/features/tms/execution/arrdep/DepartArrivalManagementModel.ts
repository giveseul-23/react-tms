import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "stopover" | "assignedOrder";

export function useDepartArrivalManagementModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { defaultLayout: "vertical" });

  const { stores } = useCommonStores({
    stopTpList: { sqlProp: "CODE", keyParam: "STOP_TP" },
    dspchOpStsList: { sqlProp: "CODE", keyParam: "DSPCH_OP_STS" },
    depArrRegDivList: { sqlProp: "CODE", keyParam: "ARRDEP_REG_DIV" },
    dspchTpList: { sqlProp: "CODE", keyParam: "DSPCH_TP" },
    vehOpType: { sqlProp: "CODE", keyParam: "VEH_OP_TP" },
    ordTpList: { sqlProp: "CODE", keyParam: "ORD_TP" },
    vehTempTcd: { sqlProp: "CODE", keyParam: "VEH_TEMP_TCD" },
    itmUomList: { sqlProp: "CODE", keyParam: "ITEM_UOM" },
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

export type DepartArrivalManagementModel = ReturnType<
  typeof useDepartArrivalManagementModel
>;
