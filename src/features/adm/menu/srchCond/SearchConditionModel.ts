import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useSearchConditionModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { pageSize: 500 });

  const { codeMap } = useCommonStores({
    dataTypeList: { sqlProp: "CODE", keyParam: "DATA_TP" },
    displayTypeList: { sqlProp: "CODE", keyParam: "DSPL_TP" },
    operatorTypeList: { sqlProp: "CODE", keyParam: "OPRT_TP" },
  });
  return {
    ...base,
    codeMap,
  };
}

export type SearchConditionModel = ReturnType<typeof useSearchConditionModel>;
