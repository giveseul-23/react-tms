import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// 단일 그리드 — 주문계약 목록
export type GridKey = "main";

export function useSettlementOrderContractModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 — 주문진행상태 / 매출진행상태 / 매출계산결과메시지 (서버 Model 의 sqlProp:'CODE' 스토어)
  const { codeMap } = useCommonStores({
    shpmOperStatus: { sqlProp: "CODE", keyParam: "SHPM_OP_STS" },
    arFiStatus: { sqlProp: "CODE", keyParam: "AR_FI_STS" },
    arResultMessage: { sqlProp: "CODE", keyParam: "AR_CALC_RSLT_MSG_CD" },
  });

  return { ...base, codeMap };
}

export type SettlementOrderContractModel = ReturnType<
  typeof useSettlementOrderContractModel
>;
