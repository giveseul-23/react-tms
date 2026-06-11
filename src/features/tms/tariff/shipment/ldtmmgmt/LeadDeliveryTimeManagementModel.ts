import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "main";

export function useLeadDeliveryTimeManagementModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);
  return { ...base };
}

export type LeadDeliveryTimeManagementModel = ReturnType<
  typeof useLeadDeliveryTimeManagementModel
>;
