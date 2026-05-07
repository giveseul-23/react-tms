import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "header" | "subCnfg" | "detail";

export function useLogisticGroupDefaultModel(menuCode: string) {
  return useBaseModel<GridKey>(menuCode);
}

export type LogisticGroupDefaultModel = ReturnType<
  typeof useLogisticGroupDefaultModel
>;
