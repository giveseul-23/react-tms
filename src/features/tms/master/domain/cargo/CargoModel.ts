import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "main";

export function useCargoModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);
  return { ...base };
}

export type CargoModel = ReturnType<typeof useCargoModel>;
