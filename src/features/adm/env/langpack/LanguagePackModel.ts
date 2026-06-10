import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useLanguagePackModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { pageSize: 500 });

  const { codeMap } = useCommonStores({
    langTypeList: { sqlProp: "CODE", keyParam: "LANG_TP" },
    applCodeList: { sqlProp: "SELECT_APPLICATION_CODE_NAME" },
  });

  return {
    ...base,
    codeMap,
  };
}

export type LanguagePackModel = ReturnType<typeof useLanguagePackModel>;
