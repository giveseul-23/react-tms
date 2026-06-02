import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "main";

export function useArSubChargeModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);
  return { ...base };
}

export type ArSubChargeModel = ReturnType<
  typeof useArSubChargeModel
>;
