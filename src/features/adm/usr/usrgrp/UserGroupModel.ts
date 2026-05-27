import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "main" | "sub01" | "sub02" | "sub03";

export function useUserGroupModel(menuCode: string) {
  return useBaseModel<GridKey>(menuCode, { pageSize: 500 });
}

export type UserGroupModel = ReturnType<typeof useUserGroupModel>;
