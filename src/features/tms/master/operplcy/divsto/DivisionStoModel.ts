import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "main" | "detail";

export function useDivisionStoModel(menuCode: string) {
  return useBaseModel<GridKey>(menuCode);
}

export type DivisionStoModel = ReturnType<typeof useDivisionStoModel>;
