import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "main";

export function useUserPlanModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // codeKey(combo) 컬럼이 없어 빈 codeMap. (combo 추가 시 useCommonStores 로 채움)
  const codeMap: Record<string, Record<string, string>> = {};

  return { ...base, codeMap };
}

export type UserPlanModel = ReturnType<typeof useUserPlanModel>;
