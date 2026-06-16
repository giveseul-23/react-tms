import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// main: 협력사단위 / sub01: 차량단위요약 / sub02: 상세
export type GridKey = "main" | "sub01" | "sub02";

export function usePboxRetQtyMgmtModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 — 물동량처리상태 / 기간구분
  const { codeMap } = useCommonStores({
    itmqtyOpSts: { sqlProp: "CODE", keyParam: "ITMQTY_OP_STS" },
    pboxTermTp: { sqlProp: "CODE", keyParam: "PBOX_TERM_TP" },
  });

  return { ...base, codeMap };
}

export type PboxRetQtyMgmtModel = ReturnType<typeof usePboxRetQtyMgmtModel>;
