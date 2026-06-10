import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "sub01" | "sub02";

export function useCommonCodeModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);
  const { codeMap } = useCommonStores({
    codeLangList: { sqlProp: "CODE", keyParam: "LANG_TP" },
    applCodeList: { sqlProp: "SELECT_APPLICATION_CODE_NAME" },
  });

  return {
    ...base,
    codeMap,
  };
}

export type CommonCodeModel = ReturnType<typeof useCommonCodeModel>;
