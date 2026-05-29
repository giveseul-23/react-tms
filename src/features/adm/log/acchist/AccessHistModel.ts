import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "main";

export function useAccessHistModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { pageSize: 500 });
  return {
    ...base,
  };
}

export type AccessHistModel = ReturnType<typeof useAccessHistModel>;
