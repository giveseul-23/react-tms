import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "detail";

export function useRangeMgmtModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    rngCalcTcd: { sqlProp: "CODE", keyParam: "RNG_CALC_TCD" },
  });

  return { ...base, codeMap };
}

export type RangeMgmtModel = ReturnType<typeof useRangeMgmtModel>;
