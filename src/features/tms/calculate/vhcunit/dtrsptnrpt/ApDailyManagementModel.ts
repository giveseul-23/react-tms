import { useState, useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";
import {
  DAILY_MAIN_COLUMN_DEFS,
  DAILY_DETAIL_COLUMN_DEFS,
} from "./ApDailyManagementColumns";

export type GridKey = "main" | "detail";

export function useApDailyManagementModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { defaultLayout: "vertical" });

  // 동적 컬럼 (조회 시 CHG_CD 메타로 재생성)
  const [mainColumnDefs, setMainColumnDefs] = useState<any[]>(
    DAILY_MAIN_COLUMN_DEFS,
  );
  const [detailColumnDefs, setDetailColumnDefs] = useState<any[]>(
    DAILY_DETAIL_COLUMN_DEFS,
  );

  const { stores } = useCommonStores({
    workTp: { sqlProp: "CODE", keyParam: "WORK_DAY_TP" },
    workTpExe: { sqlProp: "CODE", keyParam: "EXEC_WORK_DAY_TP" },
    fiStsList: { sqlProp: "CODE", keyParam: "AP_FI_STS" },
    dspchOpTpList: { sqlProp: "CODE", keyParam: "DSPCH_OP_TP" },
    vehicleTransType: { sqlProp: "CODE", keyParam: "TRANS_TCD" },
    calTcd: { sqlProp: "CODE", keyParam: "CAL_TCD" },
    dlySetlSts: { sqlProp: "CODE", keyParam: "DLY_SETL_STS" },
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
    mainColumnDefs,
    setMainColumnDefs,
    detailColumnDefs,
    setDetailColumnDefs,
    codeMap,
  };
}

export type ApDailyManagementModel = ReturnType<
  typeof useApDailyManagementModel
>;
