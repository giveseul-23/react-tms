// 화면 고유 Model — useGridModel 베이스 훅에 featureConfig 만 주입.
// extras 에서 codeMap (공통코드) + layout 토글 state 등록.

import { useState, useMemo } from "react";
import { useGridModel } from "@/hooks/useGridFeature/useGridModel";
import { useCommonStores } from "@/hooks/useCommonStores";
import type { FeatureConfig } from "@/hooks/useGridFeature/types";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import { confirmDispatchApi } from "./ConfirmDispatchApi";

export const confirmDispatchFeatureConfig: FeatureConfig = {
  api: confirmDispatchApi,
  selections: ["config", "order"],
  extras: () => {
    const [layout, setLayout] = useState<LayoutType>("vertical");

    const { stores } = useCommonStores({
      dspchOpSts: { sqlProp: "CODE", keyParam: "DSPCH_OP_STS" },
      stopTp: { sqlProp: "CODE", keyParam: "STOP_TP" },
      shpmOpSts: { sqlProp: "CODE", keyParam: "SHPM_OP_STS" },
      itmUom: { sqlProp: "CODE", keyParam: "ITM_UOM" },
      podTcd: { sqlProp: "CODE", keyParam: "POD_TCD" },
      podOpSts: { sqlProp: "CODE", keyParam: "POD_OP_STS" },
      dspchPodOpSts: { sqlProp: "CODE", keyParam: "DSPCH_POD_OP_STS" },
      podLogEvntCd: { sqlProp: "CODE", keyParam: "POD_LOG_EVNT_CD" },
      vehOpType: { sqlProp: "CODE", keyParam: "VEH_OP_TP" },
      invSys: { sqlProp: "CODE", keyParam: "HARIM_INV_SYS_ID" },
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
    // master 행 클릭 시 fan-out — 3개 동시 fetch
    order: {
      type: "array",
      api: { fetch: "getShipmentList" },
      fetchOnRowClickFrom: "config",
      paramMap: (row) => ({
        DSPCH_NO: row?.DSPCH_NO,
        PLN_ID: row?.PLN_ID,
      }),
    },
    receipt: {
      type: "array",
      api: { fetch: "getPodList" },
      fetchOnRowClickFrom: "config",
      paramMap: (row) => ({
        DSPCH_NO: row?.DSPCH_NO,
        PLN_ID: row?.PLN_ID,
      }),
    },
    receiptHistory: {
      type: "array",
      api: { fetch: "getPodEventLogList" },
      fetchOnRowClickFrom: "config",
      paramMap: (row) => ({
        DSPCH_NO: row?.DSPCH_NO,
        PLN_ID: row?.PLN_ID,
      }),
    },
    // order 행 클릭 시 cascade
    orderItem: {
      type: "array",
      api: { fetch: "getShipmentDetailList" },
      fetchOnRowClickFrom: "order",
      paramMap: (row) => ({
        DSPCH_NO: row?.DSPCH_NO,
        SHPM_ID: row?.SHPM_ID,
        PLN_ID: row?.PLN_ID,
      }),
    },
  },
};

export function useConfirmDispatchModel() {
  return useGridModel(confirmDispatchFeatureConfig);
}

export type ConfirmDispatchModel = ReturnType<typeof useConfirmDispatchModel>;
