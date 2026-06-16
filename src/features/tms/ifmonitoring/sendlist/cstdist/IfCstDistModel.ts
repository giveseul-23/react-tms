import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "sub01";

export function useIfCstDistModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    interfaceStatus: { sqlProp: "CODE", keyParam: "IF_PRCS_STS" },
    interfaceMessage: { sqlProp: "CODE", keyParam: "IF_PRCS_MSG_CD" },
    cstDistDataTcd: { sqlProp: "CODE", keyParam: "CST_DIST_DATA_TCD" },
  });

  return { ...base, codeMap };
}

export type IfCstDistModel = ReturnType<typeof useIfCstDistModel>;
