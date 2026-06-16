import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// main: 물동량 / sub01: 배차할당운송 / sub02: 운송상세 / sub03: 수치변경이력
export type GridKey = "main" | "sub01" | "sub02" | "sub03";

export function useItmQtyCfmMgmtModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 — 물동량처리상태 / 레인상태 / 품목단위(UOM)
  const { codeMap } = useCommonStores({
    itmqtyOpSts: { sqlProp: "CODE", keyParam: "ITMQTY_OP_STS" },
    laneSts: { sqlProp: "CODE", keyParam: "LANE_STS" },
    itmUomList: { sqlProp: "CODE", keyParam: "ITEM_UOM" },
  });

  return { ...base, codeMap };
}

export type ItmQtyCfmMgmtModel = ReturnType<typeof useItmQtyCfmMgmtModel>;
