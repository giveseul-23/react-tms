import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "main" | "detail";

export function useDistanceTransitTimeHisModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);
  return { ...base };
}

export type DistanceTransitTimeHisModel = ReturnType<typeof useDistanceTransitTimeHisModel>;