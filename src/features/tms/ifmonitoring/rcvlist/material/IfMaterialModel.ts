import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "sub01" | "sub02" | "sub03";

export function useIfMaterialModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    interfaceType: { sqlProp: "CODE", keyParam: "IF_TCD" },
    interfaceStatus: { sqlProp: "CODE", keyParam: "IF_PRCS_STS" },
    interfaceMessage: { sqlProp: "CODE", keyParam: "IF_PRCS_MSG_CD" },
    itemType: { sqlProp: "CODE", keyParam: "HARIM_ITEM_TYPE" },
    extItemGrp: { sqlProp: "CODE", keyParam: "HARIM_EXT_ITEM_GRP" },
    itemFcd: { sqlProp: "CODE", keyParam: "HARIM_ITEM_FCD" },
    itemClass: { sqlProp: "CODE", keyParam: "HARIM_ITEM_CLASS" },
    plantItemSts: { sqlProp: "CODE", keyParam: "HARIM_PLANT_ITEM_STS" },
    pkgType: { sqlProp: "CODE", keyParam: "HARIM_PKG_TYPE" },
    vehTempTcd: { sqlProp: "CODE", keyParam: "VEH_TEMP_TCD" },
    chaItemSts: { sqlProp: "CODE", keyParam: "HARIM_CHA_ITEM_STS" },
    extBoxType: { sqlProp: "CODE", keyParam: "HARIM_EXT_BOX_TYPE" },
  });

  return { ...base, codeMap };
}

export type IfMaterialModel = ReturnType<typeof useIfMaterialModel>;
