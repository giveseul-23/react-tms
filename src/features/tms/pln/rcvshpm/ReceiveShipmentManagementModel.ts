import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "sub01";

export function useReceiveShipmentManagementModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { stores, codeMap } = useCommonStores({
    ordTpList: { sqlProp: "CODE", keyParam: "ORD_TP" },
    shpmTpList: { sqlProp: "CODE", keyParam: "SHPM_TP" },
    shpmOpStsList: { sqlProp: "CODE", keyParam: "SHPM_OP_STS" },
    itmUomList: { sqlProp: "CODE", keyParam: "ITEM_UOM" },
    ordCreFlag: { sqlProp: "CODE", keyParam: "HARIM_ORD_CRE_TP_CD" },
    docTp: { sqlProp: "CODE", keyParam: "DOC_TYPE" },
    dlvryTp: { sqlProp: "CODE", keyParam: "HARIM_ORD_DLV_TP_CD" },
    ynList: { sqlProp: "CODE", keyParam: "YN" },
    uomSystemList: { sqlProp: "CODE", keyParam: "UOM_SYSTEM" },
    invSysList: { sqlProp: "CODE", keyParam: "HARIM_INV_SYS_ID" },
    arCntrctlcdList: { sqlProp: "CODE", keyParam: "AR_CNTRCT_LCD" },
  });

  return { ...base, stores, codeMap };
}

export type ReceiveShipmentManagementModel = ReturnType<
  typeof useReceiveShipmentManagementModel
>;