import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useIfDispatchResultModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    interfaceType: { sqlProp: "CODE", keyParam: "IF_TCD" },
    interfaceStatus: { sqlProp: "CODE", keyParam: "IF_PRCS_STS" },
    invSysList: { sqlProp: "CODE", keyParam: "HARIM_INV_SYS_ID" },
    vehGrpCd: { sqlProp: "CODE", keyParam: "VEH_GRP_CD" },
    ordTpList: { sqlProp: "CODE", keyParam: "ORD_TP" },
  });

  return { ...base, codeMap };
}

export type IfDispatchResultModel = ReturnType<typeof useIfDispatchResultModel>;
