import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "sendMain" | "sendDetail" | "rcvMain" | "rcvDetail";

export function useTransferedShipmentMgmtModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    shpmTpList: { sqlProp: "CODE", keyParam: "SHPM_TP" },
    shpmOpStsList: { sqlProp: "CODE", keyParam: "SHPM_OP_STS" },
    itmUomList: { sqlProp: "CODE", keyParam: "ITEM_UOM" },
    vehTempTcd: { sqlProp: "CODE", keyParam: "VEH_TEMP_TCD" },
    ordTpList: { sqlProp: "CODE", keyParam: "ORD_TP" },
  });

  return { ...base, codeMap };
}

export type TransferedShipmentMgmtModel = ReturnType<
  typeof useTransferedShipmentMgmtModel
>;
