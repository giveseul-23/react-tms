import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "main" | "sub01" | "sub02";

export function useFuelEfficiencyModel(menuCode: string) {
  return useBaseModel<GridKey>(menuCode);
}

export type FuelEfficiencyModel = ReturnType<typeof useFuelEfficiencyModel>;
