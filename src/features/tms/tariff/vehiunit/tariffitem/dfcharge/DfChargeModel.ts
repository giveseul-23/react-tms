import { useBaseModel } from "@/app/feature/useBaseModel";
import { getSessionFields } from "@/app/services/auth/auth";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "detail";

export function useDfChargeModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
      dfChgOpDivTcd: { sqlProp: "CODE", keyParam: "DF_CHG_OP_DIV_TCD" },
      rateAllcRuleCd: { sqlProp: "CODE", keyParam: "RATE_ALLC_RULE_CD" },
      gnrlLdgrCd: { sqlProp: "CODE", keyParam: "GNRL_LDGR_CD" },
      roundingType: { sqlProp: "selectRoundingRuleForDfCharge", keyParam: getSessionFields().sesLang },
    });
  
    return { ...base, codeMap };
}

export type DfChargeModel = ReturnType<typeof useDfChargeModel>;