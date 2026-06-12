import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "conditionInfo";

export function useRateBatchModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { defaultLayout: "vertical" });

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
      { CODE: "BETWEEN", NAME: "BETWEEN" },
    ],
  });

  return { ...base, codeMap };
}

export type RateBatchModel = ReturnType<typeof useRateBatchModel>;
