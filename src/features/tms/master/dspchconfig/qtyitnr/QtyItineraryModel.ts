import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "main";

export function useQtyItineraryModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);
  return { ...base };
}

export type QtyItineraryModel = ReturnType<typeof useQtyItineraryModel>;
