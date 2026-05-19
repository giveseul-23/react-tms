import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useWorkdaysModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    wrkDayTp: { sqlProp: "CODE", keyParam: "WRK_DAY_TP" },
  });

  return { ...base, codeMap };
}

export type WorkdaysModel = ReturnType<typeof useWorkdaysModel>;
