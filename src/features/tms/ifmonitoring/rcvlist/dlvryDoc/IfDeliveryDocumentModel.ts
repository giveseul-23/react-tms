import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "detail";

export function useIfDeliveryDocumentModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { defaultLayout: "vertical" });

  const { stores } = useCommonStores({
    interfaceType: { sqlProp: "CODE", keyParam: "IF_TCD" },
    interfaceStatus: { sqlProp: "CODE", keyParam: "IF_PRCS_STS" },
    vehicleTransType: { sqlProp: "CODE", keyParam: "TRANS_TCD" },
    weightType: { sqlProp: "CODE", keyParam: "WGT_TP" },
    itemTypeCode: { sqlProp: "CODE", keyParam: "ITEM_TCD" },
    temporatureTypeCode: { sqlProp: "CODE", keyParam: "ITEM_TCD" },
    itemUom: { sqlProp: "CODE", keyParam: "ITEM_UOM" },
    interfaceMessage: { sqlProp: "CODE", keyParam: "IF_PRCS_MSG_CD" },
    ordCreFlag: { sqlProp: "CODE", keyParam: "HARIM_ORD_CRE_TP_CD" },
    dlvryTp: { sqlProp: "CODE", keyParam: "HARIM_ORD_DLV_TP_CD" },
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

export type IfDeliveryDocumentModel = ReturnType<
  typeof useIfDeliveryDocumentModel
>;
