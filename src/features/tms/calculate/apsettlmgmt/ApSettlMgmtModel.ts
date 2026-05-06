// 화면 고유 Model — useGridModel 베이스 훅에 featureConfig 만 주입.
// extras 에서 codeMap (공통코드) + layout 토글 state.

import { useState, useMemo } from "react";
import { useGridModel } from "@/hooks/useGridFeature/useGridModel";
import { useCommonStores } from "@/hooks/useCommonStores";
import type { FeatureConfig } from "@/hooks/useGridFeature/types";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import { apSettlMgmtApi } from "./ApSettlMgmtApi";

// master 행 클릭 시 fan-out 으로 8개 sub 그리드 동시 fetch.
// SUMMARY 탭의 right-grid 4개(monthlyFare/hireDispatchPay/freightPay/indirectPay)는
// 의미상 SUMMARY 의 자식이지만 SUMMARY API 가 없고 master 행만 있어도 됨 → 모두 master 자식.
const masterChildParamMap = (row: any) => ({
  AP_SETL_ID: row?.AP_SETL_ID,
  LGST_GRP_CD: row?.LGST_GRP_CD,
});

export const apSettlMgmtFeatureConfig: FeatureConfig = {
  api: apSettlMgmtApi,
  selections: ["config"],
  pageSize: 500,
  extras: () => {
    const [layout, setLayout] = useState<LayoutType>("vertical");

    const { stores } = useCommonStores({
      apSetlDetailType: { sqlProp: "CODE", keyParam: "AP_SETL_DTL_TCD" },
      apSetlDescType: { sqlProp: "CODE", keyParam: "APPLD_VAL_TCD" },
      fiSts: { sqlProp: "CODE", keyParam: "AP_FI_STS" },
      costCenter: { sqlProp: "CODE", keyParam: "CST_CNTR_GL_RC_TCD" },
      cstDistSts: { sqlProp: "CODE", keyParam: "CST_DIST_STS" },
      cstCntrCd: { sqlProp: "selectCstCntrCodeName" },
    });

    const codeMap = useMemo(() => {
      const map: Record<string, Record<string, string>> = {};
      Object.entries(stores).forEach(([storeKey, items]) => {
        map[storeKey] = {};
        (items ?? []).forEach((item: any) => {
          map[storeKey][item.CODE] = item.NAME;
        });
      });
      return map;
    }, [stores]);

    return { layout, setLayout, codeMap };
  },
  grids: {
    config: {
      type: "paginated",
      api: { fetch: "getList" },
    },
    summary: {
      type: "array",
      api: { fetch: "getSummaryList" },
      fetchOnRowClickFrom: "config",
      paramMap: masterChildParamMap,
    },
    monthlyFare: {
      type: "array",
      api: { fetch: "getMonthlyFareList" },
      fetchOnRowClickFrom: "config",
      paramMap: masterChildParamMap,
    },
    hireDispatchPay: {
      type: "array",
      api: { fetch: "getHireDispatchPayList" },
      fetchOnRowClickFrom: "config",
      paramMap: masterChildParamMap,
    },
    freightPay: {
      type: "array",
      api: { fetch: "getFreightPayList" },
      fetchOnRowClickFrom: "config",
      paramMap: masterChildParamMap,
    },
    indirectPay: {
      type: "array",
      api: { fetch: "getIndirectPayList" },
      fetchOnRowClickFrom: "config",
      paramMap: masterChildParamMap,
    },
    costCenter: {
      type: "array",
      api: { fetch: "getEachCostOrGlList" },
      fetchOnRowClickFrom: "config",
      paramMap: masterChildParamMap,
    },
    materialCost: {
      type: "array",
      api: { fetch: "getEachItmCostList" },
      fetchOnRowClickFrom: "config",
      paramMap: masterChildParamMap,
    },
    evidence: {
      type: "array",
      api: { fetch: "getDocFileList" },
      fetchOnRowClickFrom: "config",
      paramMap: masterChildParamMap,
    },
  },
};

export function useApSettlMgmtModel() {
  return useGridModel(apSettlMgmtFeatureConfig);
}

export type ApSettlMgmtModel = ReturnType<typeof useApSettlMgmtModel>;
