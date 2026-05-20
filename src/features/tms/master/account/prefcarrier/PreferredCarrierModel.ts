import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "main";

export function usePreferredCarrierModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);
  return { ...base };
}

export type PreferredCarrierModel = ReturnType<typeof usePreferredCarrierModel>;