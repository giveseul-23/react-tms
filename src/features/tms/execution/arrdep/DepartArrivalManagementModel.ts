import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "stopover" | "assignedOrder" | "shipmentDetail";

export function useDepartArrivalManagementModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { defaultLayout: "vertical" });

  const { codeMap } = useCommonStores({
    stopTpList: { sqlProp: "CODE", keyParam: "STOP_TP" },
    dspchOpStsList: { sqlProp: "CODE", keyParam: "DSPCH_OP_STS" },
    depArrRegDivList: { sqlProp: "CODE", keyParam: "ARRDEP_REG_DIV" },
    dspchTpList: { sqlProp: "CODE", keyParam: "DSPCH_TP" },
    vehOpType: { sqlProp: "CODE", keyParam: "VEH_OP_TP" },
    ordTpList: { sqlProp: "CODE", keyParam: "ORD_TP" },
    vehTempTcd: { sqlProp: "CODE", keyParam: "VEH_TEMP_TCD" },
    itmUomList: { sqlProp: "CODE", keyParam: "ITEM_UOM" },
  });

  return { ...base, codeMap };
}

export type DepartArrivalManagementModel = ReturnType<
  typeof useDepartArrivalManagementModel
>;
