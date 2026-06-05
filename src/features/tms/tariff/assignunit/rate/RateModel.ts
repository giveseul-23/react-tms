import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "costInfo" | "conditionInfo";

export function useRateModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    operatorTypeList: [
      { CODE: "*", NAME: "*" },
      { CODE: "/", NAME: "/" },
    ],
    operatorTypeList_AndOr: [
      { CODE: "AND", NAME: "AND" },
      { CODE: "OR", NAME: "OR" },
    ],
    calcOptTypeList: [
      { CODE: "=", NAME: "=" },
      { CODE: "!=", NAME: "!=" },
      { CODE: ">", NAME: ">" },
      { CODE: "<", NAME: "<" },
      { CODE: ">=", NAME: ">=" },
      { CODE: "<=", NAME: "<=" },
      { CODE: "BETWEEN", NAME: "BETWEEN" },
      { CODE: "IN", NAME: "IN" },
      { CODE: "ALL_IN", NAME: "ALL_IN" },
      { CODE: "NOT_IN", NAME: "NOT_IN" },
    ],
    rdngRcdList: { sqlProp: "CODE", keyParam: "RDNG_RCD" },
  });

  return { ...base, codeMap };
}

export type RateModel = ReturnType<typeof useRateModel>;
