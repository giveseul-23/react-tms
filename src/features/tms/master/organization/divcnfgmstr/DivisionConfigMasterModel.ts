// 화면 고유 Model — useGridModel 베이스 훅에 featureConfig 만 주입.

import { useGridModel } from "@/hooks/useGridFeature/useGridModel";
import type { FeatureConfig } from "@/hooks/useGridFeature/types";
import { divisionConfigMasterApi } from "./DivisionConfigMasterApi";

export const divisionConfigMasterFeatureConfig: FeatureConfig = {
  api: divisionConfigMasterApi,
  selections: ["config", "detail"],
  fetchListExtraParams: {
    // Division 은 외부 탭이 없어 항상 빈 값 — 시각/동작 보존 위해 유지
    LGST_GRP_CNFG_GRP_CD: () => "",
  },
  grids: {
    config: {
      type: "paginated",
      api: { fetch: "getConfigList", save: "saveConfig" },
      rowKey: "CNFG_CD",
      newRow: () => ({
        LGST_GRP_OPR_CONFIG_CD: "",
        LGST_GRP_OPR_CONFIG_NM: "",
      }),
    },
    detail: {
      type: "paginated",
      api: { fetch: "getConfigDetailList", save: "saveConfigDetail" },
      rowKey: ["CNFG_CD", "CNFG_DTL_CD"],
      fetchOnRowClickFrom: "config",
      paramMap: (row) => ({ CNFG_CD: row?.CNFG_CD }),
      newRow: (m) => ({
        LGST_GRP_OPR_CONFIG_CD:
          m.selected.config?.ref.current?.LGST_GRP_OPR_CONFIG_CD,
        LGST_GRP_OPR_CONFIG_DTL_CD: "",
        LGST_GRP_OPR_CONFIG_DTL_NM: "",
      }),
    },
    i18n: {
      type: "array",
      api: { fetch: "getConfigI18nList", save: "saveConfigI18n" },
      rowKey: ["CNFG_CD", "CNFG_DTL_CD", "LANG_TP"],
      fetchOnRowClickFrom: "detail",
      paramMap: (row) => ({
        CNFG_CD: row?.CNFG_CD,
        CNFG_DTL_CD: row?.CNFG_DTL_CD,
      }),
      newRow: (m) => ({
        LGST_GRP_OPR_CONFIG_CD:
          m.selected.config?.ref.current?.LGST_GRP_OPR_CONFIG_CD,
        LANG_TP: "",
        LGST_GRP_OPR_CONFIG_NM: "",
      }),
      subTitle: "LBL_CNFG_CD_LANG_SETTING",
    },
    detailI18n: {
      type: "array",
      api: { fetch: "getConfigDetailI18nList", save: "saveConfigDetailI18n" },
      fetchOnRowClickFrom: "i18n",
      paramMap: (row) => ({
        CNFG_CD: row?.CNFG_CD,
        CNFG_DTL_CD: row?.CNFG_DTL_CD,
      }),
      newRow: (m) => ({
        LGST_GRP_OPR_CONFIG_CD:
          m.selected.config?.ref.current?.LGST_GRP_OPR_CONFIG_CD,
        LGST_GRP_OPR_CONFIG_DTL_CD:
          m.selected.detail?.ref.current?.LGST_GRP_OPR_CONFIG_DTL_CD,
        LANG_TP: "",
        LGST_GRP_OPR_CONFIG_DTL_NM: "",
      }),
      subTitle: "LBL_CNFG_DTL_CD_LANG_SETTING",
    },
  },
};

export function useDivisionConfigMasterModel() {
  return useGridModel(divisionConfigMasterFeatureConfig);
}

export type DivisionConfigMasterModel = ReturnType<
  typeof useDivisionConfigMasterModel
>;
