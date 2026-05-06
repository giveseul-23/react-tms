// 화면 고유 Model — useGridModel 베이스 훅에 featureConfig 만 주입.
// extras 에서 외부 탭(configTabs/activeTab) state + 자동 로드 useEffect 등록.

import { useEffect, useState } from "react";
import { useGridModel } from "@/hooks/useGridFeature/useGridModel";
import type { FeatureConfig } from "@/hooks/useGridFeature/types";
import { lgstgrpOprConfigApi } from "./LgstgrpOprConfigApi";

type ConfigTab = { key: string; label: string };

// ────────────────────────────────────────────────────────────────
// Feature config — Model + Controller 공용. 그리드 4종 + cascade 흐름.
// ────────────────────────────────────────────────────────────────
export const lgstgrpFeatureConfig: FeatureConfig = {
  api: lgstgrpOprConfigApi,
  selections: ["config", "detail"],
  fetchListExtraParams: {
    LGST_GRP_CNFG_GRP_CD: (m) => m.activeTab,
  },
  extras: () => {
    const [configTabs, setConfigTabs] = useState<ConfigTab[]>([]);
    const [activeTab, setActiveTab] = useState<string>("");

    useEffect(() => {
      lgstgrpOprConfigApi
        .getConfigTypeList()
        .then((res: any) => {
          const rows = res.data?.data?.dsOut ?? res.data?.result ?? [];
          const tabs: ConfigTab[] = rows.map((r: any) => ({
            key: r.CODE ?? r.CONFIG_TP_CD,
            label: r.NAME ?? r.CONFIG_TP_NM ?? r.CODE,
          }));
          setConfigTabs(tabs);
          if (tabs.length > 0) setActiveTab(tabs[0].key);
        })
        .catch((err) =>
          console.error("[LgstgrpOprConfigMst] getConfigTypeList failed", err),
        );
    }, []);

    return { configTabs, activeTab, setActiveTab };
  },
  grids: {
    config: {
      type: "paginated",
      api: { fetch: "getConfigList", save: "saveConfig" },
      rowKey: "CNFG_CD",
      newRow: () => ({ CNFG_CD: "", CNFG_NM: "" }),
    },
    detail: {
      type: "paginated",
      api: { fetch: "getConfigDetailList", save: "saveConfigDetail" },
      rowKey: ["CNFG_CD", "CNFG_DTL_CD"],
      fetchOnRowClickFrom: "config",
      paramMap: (row) => ({ CNFG_CD: row?.CNFG_CD }),
      newRow: (m) => ({
        CNFG_CD: m.selected.config?.ref.current?.CNFG_CD,
        CNFG_DTL_CD: "",
        CNFG_DTL_NM: "",
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
        CNFG_CD: m.selected.config?.ref.current?.CNFG_CD,
        CNFG_DTL_CD: m.selected.detail?.ref.current?.CNFG_DTL_CD,
        LANG_TP: "",
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
        CNFG_CD: m.selected.config?.ref.current?.CNFG_CD,
        CNFG_DTL_CD: m.selected.detail?.ref.current?.CNFG_DTL_CD,
        LANG_TP: "",
      }),
      subTitle: "LBL_CNFG_DTL_CD_LANG_SETTING",
    },
  },
};

export function useLgstgrpOprConfigMstModel() {
  return useGridModel(lgstgrpFeatureConfig);
}

export type LgstgrpOprConfigMstModel = ReturnType<
  typeof useLgstgrpOprConfigMstModel
>;
