"use client";

import { useMemo, useState } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export type TemperatureHistoryPoint = {
  PSTN_DTTM: string;
  timeLabel: string;
  CHLD_TMPR: number | null;
  FRZN_TMPR: number | null;
};

export type TemperatureStandard = {
  frznFrom: number;
  frznTo: number;
  chldFrom: number;
  chldTo: number;
};

export function useDtgDailyTemperHisModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { pageSize: 500 });
  const [fridgeData, setFridgeData] = useState<TemperatureHistoryPoint[]>([]);
  const [frozenData, setFrozenData] = useState<TemperatureHistoryPoint[]>([]);
  const [standard, setStandard] = useState<TemperatureStandard | null>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const { stores } = useCommonStores({
    vehOpTypeList: { sqlProp: "CODE", keyParam: "VEH_OP_TP" },
    temperCntrlType: { sqlProp: "CODE", keyParam: "TMPR_VLTN_PLCY_CD" },
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

  return {
    ...base,
    stores,
    codeMap,
    fridgeData,
    setFridgeData,
    frozenData,
    setFrozenData,
    standard,
    setStandard,
    selectedRow,
    setSelectedRow,
  };
}

export type DtgDailyTemperHisModel = ReturnType<typeof useDtgDailyTemperHisModel>;
