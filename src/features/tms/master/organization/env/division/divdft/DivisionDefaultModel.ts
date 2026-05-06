import { useGridModel } from "@/hooks/useGridFeature/useGridModel";
import type { FeatureConfig } from "@/hooks/useGridFeature/types";
import { divisionDefaultApi } from "./DivisionDefaultApi";

export const divisionDefaultConfig: FeatureConfig = {
  api: divisionDefaultApi,
  selections: ["main", "detail"],
  grids: {
    main: {
      type: "paginated",
      api: { fetch: "getDivisionDefaultList", save: "saveDivisionDefaultList" },
      rowKey: "CNFG_CD",
      newRow: () => ({ CNFG_CD: "", CNFG_NM: "" }),
    },
    detail: {
      type: "paginated",
      api: {
        fetch: "getDivisionDefaultDetailList",
        save: "saveDivisionDefaultDetailList",
      },
      rowKey: ["CNFG_CD", "CNFG_DTL_CD"],
      fetchOnRowClickFrom: "main",
      paramMap: (row) => ({ CNFG_CD: row?.CNFG_CD }),
      newRow: (m) => ({
        CNFG_CD: m.selected.main?.ref.current?.CNFG_CD,
      }),
    },
  },
};

export function useDivisionDefaultModel() {
  return useGridModel(divisionDefaultConfig);
}

export type DivisionDefaultModel = ReturnType<typeof useDivisionDefaultModel>;
