import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "billingItem" | "orderInfo" | "attachment";

export function useOperatorArBillingInquiryModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    arContractLevel: { sqlProp: "CODE", keyParam: "AR_CNTRCT_LCD" },
    arResultMessage: { sqlProp: "CODE", keyParam: "AR_CALC_RSLT_MSG_CD" },
    chargeSignType: { sqlProp: "CODE", keyParam: "CHG_SIGN_TP" },
    arFiStatus: { sqlProp: "CODE", keyParam: "AR_FI_STS" },
    arCalcTypeCode: { sqlProp: "CODE", keyParam: "AR_CALC_TCD" },
    arTariffLevelCode: { sqlProp: "CODE", keyParam: "AR_TRF_LCD" },
    arBaseDateType: { sqlProp: "CODE", keyParam: "AR_STL_BASE_DT_TP" },
  });

  return { ...base, codeMap };
}

export type OperatorArBillingInquiryModel = ReturnType<
  typeof useOperatorArBillingInquiryModel
>;
