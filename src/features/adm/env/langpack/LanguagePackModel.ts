import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useLanguagePackModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { pageSize: 500 });

  const { stores } = useCommonStores({
    langTypeList: { sqlProp: "CODE", keyParam: "LANG_TP" },
    applCodeList: { sqlProp: "SELECT_APPLICATION_CODE_NAME" },
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

  return {
    ...base,
    stores,
    codeMap,
  };
}

export type LanguagePackModel = ReturnType<typeof useLanguagePackModel>;
