import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "lgst" | "zone" | "rate" | "zoneCond";

export function useShpmMgmtModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { stores } = useCommonStores({
    rateRvrsPcd: { sqlProp: "CODE", keyParam: "RATE_RVRS_PCD" },
    itmUom: { sqlProp: "CODE", keyParam: "ITEM_UOM" },
    rngCalcTcd: { sqlProp: "CODE", keyParam: "RNG_CALC_TCD" },
    gnrlLdgrCd: { sqlProp: "CODE", keyParam: "GNRL_LDGR_CD" },
    cstCntrCdList: { sqlProp: "CODE", keyParam: "CST_CNTR_CD" },
    itemApplyList: { sqlProp: "CODE", keyParam: "ITEM_APPLY" },
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

  return { ...base, codeMap };
}

export type ShpmMgmtModel = ReturnType<typeof useShpmMgmtModel>;
