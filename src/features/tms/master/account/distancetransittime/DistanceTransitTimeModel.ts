import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "history";

export function useDistanceTransitTimeModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { defaultLayout: "vertical" });

  const { codeMap } = useCommonStores({
    dttoPrcsStatus: { sqlProp: "CODE", keyParam: "DTTO_PRCS_STS" },
    mapRtngOptnTcd: { sqlProp: "CODE", keyParam: "MAP_RTNG_OPTN_TCD" },
  });

  return { ...base, codeMap };
}

export type DistanceTransitTimeModel = ReturnType<
  typeof useDistanceTransitTimeModel
>;
