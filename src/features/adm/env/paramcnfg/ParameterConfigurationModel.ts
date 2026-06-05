import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useParameterConfigurationModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    cnfgUseTp: { sqlProp: "CODE", keyParam: "CNFG_USE_TP" },
  });

  return { ...base, codeMap };
}

export type ParameterConfigurationModel = ReturnType<typeof useParameterConfigurationModel>;
