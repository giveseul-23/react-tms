import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useUserPlanModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
  });

  return { ...base, codeMap };
}

export type UserPlanModel = ReturnType<typeof useUserPlanModel>;
