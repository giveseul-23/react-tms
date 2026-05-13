import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "main";

export function useCommodityModel(menuCode: string) {
  return useBaseModel<GridKey>(menuCode);
}

export type CommodityModel = ReturnType<typeof useCommodityModel>;
