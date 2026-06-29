import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// main: 물동량(협력사단위) / sub01: 요율항목 / sub02: 구간상세
export type GridKey = "main" | "sub01" | "sub02";

export function useItmQtySettlMgmtModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 — 처리상태/운임산출방식/일마감상태 + 매입문서생성 팝업용(날짜유형/생성방식/UOM)
  const { codeMap } = useCommonStores({
    apFiSts: { sqlProp: "CODE", keyParam: "AP_FI_STS" },
    calTcd: { sqlProp: "CODE", keyParam: "CAL_TCD" },
    dlySetlSts: { sqlProp: "CODE", keyParam: "DLY_SETL_STS" },
    dateType: { sqlProp: "CODE", keyParam: "DT_OPR_TCD" },
    creationMethod: { sqlProp: "CODE", keyParam: "ITEMQTY_AP_GNRTN_TCD" },
    itmUom: { sqlProp: "CODE", keyParam: "ITEM_UOM" },
  });

  return { ...base, codeMap };
}

export type ItmQtySettlMgmtModel = ReturnType<typeof useItmQtySettlMgmtModel>;
