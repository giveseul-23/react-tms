import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// 단일 그리드(상품수량 정산 등록)
export type GridKey = "main";

export function useRegisterSettlProductQtyModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 — 요일 / 물동량처리상태
  const { codeMap } = useCommonStores({
    dayOfWeeks: { module: "TMS", sqlProp: "CODE", keyParam: "DAY_OF_WEEK_TCD" },
    itmQtyOpSts: { module: "TMS", sqlProp: "CODE", keyParam: "ITMQTY_OP_STS" },
  });

  return { ...base, codeMap };
}

export type RegisterSettlProductQtyModel = ReturnType<typeof useRegisterSettlProductQtyModel>;
