import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "main" | "sub01";

export function useDriverModel(menuCode: string) {
  return useBaseModel<GridKey>(menuCode);
}

export type DriverModel = ReturnType<typeof useDriverModel>;
