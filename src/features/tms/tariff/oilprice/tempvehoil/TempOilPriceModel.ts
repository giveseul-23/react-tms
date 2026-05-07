import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "master" | "oilPrice" | "period";

export function useTempOilPriceModel(menuCode: string) {
  return useBaseModel<GridKey>(menuCode);
}

export type TempOilPriceModel = ReturnType<typeof useTempOilPriceModel>;
