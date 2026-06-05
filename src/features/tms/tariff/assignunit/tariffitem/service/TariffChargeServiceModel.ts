import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "main";

export function useTariffChargeServiceModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);
  return { ...base };
}

export type TariffChargeServiceModel = ReturnType<
  typeof useTariffChargeServiceModel
>;
