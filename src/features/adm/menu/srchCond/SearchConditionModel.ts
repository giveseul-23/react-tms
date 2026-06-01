import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useSearchConditionModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { pageSize: 500 });

  const { stores } = useCommonStores({
    dataTypeList: { sqlProp: "CODE", keyParam: "DATA_TP" },
    displayTypeList: { sqlProp: "CODE", keyParam: "DSPL_TP" },
    operatorTypeList: { sqlProp: "CODE", keyParam: "OPRT_TP" },
  });

  const codeMap = useMemo(() => {
    const map: Record<string, Record<string, string>> = {};
    Object.entries(stores).forEach(([storeKey, items]) => {
      map[storeKey] = {};
      (items ?? []).forEach((item: { CODE: string; NAME: string }) => {
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

export type SearchConditionModel = ReturnType<typeof useSearchConditionModel>;
