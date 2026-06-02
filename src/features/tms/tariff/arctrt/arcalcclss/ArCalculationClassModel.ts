import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useArCalculationClassModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    clssTypeList: { sqlProp: "CODE", keyParam: "CLSS_TP" },
  });

  return { ...base, codeMap };
}

export type ArCalculationClassModel = ReturnType<
  typeof useArCalculationClassModel
>;
