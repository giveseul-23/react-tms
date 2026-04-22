import { useState, useCallback, useMemo } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import { MAIN_COLUMN_DEFS } from "./ApMonthlyManagementColumns";

export type GridData = {
  rows: any[];
  totalCount: number;
  page: number;
  limit: number;
};

const EMPTY_GRID: GridData = {
  rows: [],
  totalCount: 0,
  page: 1,
  limit: 500,
};

export function useApMonthlyManagementModel() {
  const [layout, setLayout] = useState<LayoutType>("side");
  const [pageSize, setPageSize] = useState(500);
  const [gridData, setGridData] = useState<GridData>(EMPTY_GRID);

  // 동적 컬럼 (조회 시 CHG_CD 메타로 재생성)
  const [mainColumnDefs, setMainColumnDefs] =
    useState<any[]>(MAIN_COLUMN_DEFS);

  const resetSubGrids = useCallback(() => {
    // 단일 그리드 — 초기화 없음
  }, []);

  const { stores } = useCommonStores({
    vehicleFinStatus: { sqlProp: "CODE", keyParam: "VEH_FI_STS" },
    vehTempTcd: { sqlProp: "CODE", keyParam: "VEH_TEMP_TCD" },
    driverWorkStatus: { sqlProp: "CODE", keyParam: "DRIVER_WORK_STATUS" },
    fiStsList: { sqlProp: "CODE", keyParam: "AP_FI_STS" },
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
    layout,
    setLayout,
    pageSize,
    setPageSize,
    gridData,
    setGridData,
    mainColumnDefs,
    setMainColumnDefs,
    resetSubGrids,
    codeMap,
  };
}

export type ApMonthlyManagementModel = ReturnType<
  typeof useApMonthlyManagementModel
>;
