import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "master" | "dfOil" | "month";

export function useOilPriceModel(menuCode: string) {
  return useBaseModel<GridKey>(menuCode);
}

export type OilPriceModel = ReturnType<typeof useOilPriceModel>;
