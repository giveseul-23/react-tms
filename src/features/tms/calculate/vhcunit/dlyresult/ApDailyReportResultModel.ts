import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useApDailyReportResultModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 센차 store: creationYn (module TMS, sqlProp CODE, keyParam CREATION_YN)
  const { codeMap } = useCommonStores({
    creationYn: { sqlProp: "CODE", keyParam: "CREATION_YN" },
  });

  return { ...base, codeMap };
}

export type ApDailyReportResultModel = ReturnType<
  typeof useApDailyReportResultModel
>;
