import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useProcessModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    clssTypeList: { sqlProp: "CODE", keyParam: "CLSS_TP", module: "ADM" },
  });

  return { ...base, codeMap };
}

export type ProcessModel = ReturnType<typeof useProcessModel>;
