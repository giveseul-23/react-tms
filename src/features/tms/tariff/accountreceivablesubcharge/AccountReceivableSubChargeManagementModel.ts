import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "detail01" | "detail02";

export function useAccountReceivableSubChargeManagementModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { defaultLayout: "vertical" });

  const { codeMap } = useCommonStores({
    rdngRcd: { sqlProp: "CODE", keyParam: "RDNG_RCD" },
    costOprList: [
      { CODE: "*", NAME: "*" },
      { CODE: "/", NAME: "/" },
    ],
    lgcOprList: [
      { CODE: "AND", NAME: "AND" },
      { CODE: "OR", NAME: "OR" },
    ],
    costCondOprList: [
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
  });

  return { ...base, codeMap };
}

export type AccountReceivableSubChargeManagementModel = ReturnType<
  typeof useAccountReceivableSubChargeManagementModel
>;
