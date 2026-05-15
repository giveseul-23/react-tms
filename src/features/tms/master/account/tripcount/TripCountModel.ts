import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "main";

export function useTripCountModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);
  return { ...base };
}

export type TripCountModel = ReturnType<typeof useTripCountModel>;