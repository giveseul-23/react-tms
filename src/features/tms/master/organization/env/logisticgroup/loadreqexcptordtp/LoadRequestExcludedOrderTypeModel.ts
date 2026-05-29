import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "detail";

export function useLoadRequestExcludedOrderTypeModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // ── 공통 코드 lookup (Cell Renderer 의 codeKey 매핑용) ─────────
  const { codeMap } = useCommonStores({
    plnOpDiv: { sqlProp: "CODE", keyParam: "PLN_OP_DIV" },
    ynList: { sqlProp: "CODE", keyParam: "YN" },
  });

  return { ...base, codeMap };
}

export type LoadRequestExcludedOrderTypeModel = ReturnType<typeof useLoadRequestExcludedOrderTypeModel>;