import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "main" | "detail";

export function useDivisionDefaultModel(menuCode: string) {
  return useBaseModel<GridKey>(menuCode);
}

export type DivisionDefaultModel = ReturnType<typeof useDivisionDefaultModel>;
