import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useAccountReceivableManagementModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 lookup — codeMap 자동 생성 (서버 view model stores 대응)
  const { codeMap } = useCommonStores({
    arTrfLcdList: { sqlProp: "CODE", keyParam: "AR_TRF_LCD" },
    arStlBaseDtTpList: { sqlProp: "CODE", keyParam: "AR_STL_BASE_DT_TP" },
    arCalcTcdList: { sqlProp: "CODE", keyParam: "AR_CALC_TCD" },
    currencyCodeList: { sqlProp: "selectCurrencyCodeName" },
  });

  return { ...base, codeMap };
}

export type AccountReceivableManagementModel = ReturnType<
  typeof useAccountReceivableManagementModel
>;
