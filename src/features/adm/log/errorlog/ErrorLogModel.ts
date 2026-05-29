import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "main" | "sub01" | "sub02";

export function useErrorLogModel(menuCode: string) {
  return useBaseModel<GridKey>(menuCode, { pageSize: 500 });
}

export type ErrorLogModel = ReturnType<typeof useErrorLogModel>;
