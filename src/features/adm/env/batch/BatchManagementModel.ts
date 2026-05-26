import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "sub01" | "sub02";

export function useBatchManagementModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { pageSize: 500 });
  const { stores, codeMap } = useCommonStores({
    triggerCycleType: {
      module: "ADM",
      sqlProp: "CODE",
      keyParam: "TRGR_CCL_TYP",
    },
    jobType: {
      module: "ADM",
      sqlProp: "CODE",
      keyParam: "JOB_TYP",
    },
    jobRunType: {
      module: "ADM",
      sqlProp: "CODE",
      keyParam: "JOB_RUN_TYP",
    },
  });

  return {
    ...base,
    stores,
    codeMap,
  };
}

export type BatchManagementModel = ReturnType<typeof useBatchManagementModel>;
