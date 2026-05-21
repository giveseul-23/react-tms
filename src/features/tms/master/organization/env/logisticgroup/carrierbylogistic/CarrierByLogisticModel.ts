import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "main" | "sub01" | "sub02";

export function useCarrierByLogisticModel(menuCode: string) {
  return useBaseModel<GridKey>(menuCode);
}

export type CarrierByLogisticModel = ReturnType<
  typeof useCarrierByLogisticModel
>;
