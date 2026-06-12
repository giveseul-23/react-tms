import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useUnassignedShipmentMgmtModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    shipmentType: { sqlProp: "CODE", keyParam: "SHPM_TP" },
    ordType: { sqlProp: "CODE", keyParam: "ORD_TP" },
    dlvryType: { sqlProp: "CODE", keyParam: "HARIM_ORD_DLV_TP_CD" },
    ordCreFleg: { sqlProp: "CODE", keyParam: "HARIM_ORD_CRE_TP_CD" },
    itmUomList: { sqlProp: "CODE", keyParam: "ITEM_UOM" },
  });

  return { ...base, codeMap };
}

export type UnassignedShipmentMgmtModel = ReturnType<
  typeof useUnassignedShipmentMgmtModel
>;
