import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "main" | "detail";

export function useLogisticGroupArCustomerModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);
  return { ...base };
}

export type LogisticGroupArCustomerModel = ReturnType<typeof useLogisticGroupArCustomerModel>;