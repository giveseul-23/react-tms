import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "main" | "sub01" | "sub02" | "sub03";

export function useZoneModel(menuCode: string) {
  return useBaseModel<GridKey>(menuCode);
}

export type ZoneModel = ReturnType<typeof useZoneModel>;
