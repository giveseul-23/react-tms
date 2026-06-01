import { useBaseModel } from "@/app/feature/useBaseModel";
export type GridKey = "main";

export function useFreightClassModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  return { ...base };
}

export type FreightClassModel = ReturnType<typeof useFreightClassModel>;
