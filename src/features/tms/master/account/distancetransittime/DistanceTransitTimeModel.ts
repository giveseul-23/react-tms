import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "history";

export function useDistanceTransitTimeModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { defaultLayout: "vertical" });

  const { stores } = useCommonStores({
    dttoPrcsStatus: { sqlProp: "CODE", keyParam: "DTTO_PRCS_STS" },
    mapRtngOptnTcd: { sqlProp: "CODE", keyParam: "MAP_RTNG_OPTN_TCD" },
  });

  const codeMap = useMemo(() => {
    const map: Record<string, Record<string, string>> = {};
    Object.entries(stores).forEach(([storeKey, items]) => {
      map[storeKey] = {};
      (items ?? []).forEach((item: any) => {
        map[storeKey][item.CODE] = item.NAME;
      });
    });
    return map;
  }, [stores]);

  return { ...base, codeMap };
}

export type DistanceTransitTimeModel = ReturnType<
  typeof useDistanceTransitTimeModel
>;
