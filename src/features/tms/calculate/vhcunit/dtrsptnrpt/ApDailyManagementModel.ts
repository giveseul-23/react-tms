import { useState, useRef, useCallback, useMemo } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import {
  DAILY_MAIN_COLUMN_DEFS,
  DAILY_DETAIL_COLUMN_DEFS,
} from "./ApDailyManagementColumns";

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

export function useApDailyManagementModel() {
  const [layout, setLayout] = useState<LayoutType>("vertical");
  const [pageSize, setPageSize] = useState(500);

  // 메인 — 일일실적 그리드
  const [gridData, setGridData] = useState<GridData>(EMPTY_GRID);

  // 상세내역 그리드
  const [detailRowData, setDetailRowData] = useState<GridData>(EMPTY_GRID);

  // 동적 컬럼 (조회 시 CHG_CD 메타로 재생성)
  const [mainColumnDefs, setMainColumnDefs] = useState<any[]>(
    DAILY_MAIN_COLUMN_DEFS,
  );
  const [detailColumnDefs, setDetailColumnDefs] = useState<any[]>(
    DAILY_DETAIL_COLUMN_DEFS,
  );

  // 선택 행
  const [selectedHeaderRow, setSelectedHeaderRow] = useState<any>(null);
  const selectedHeaderRowRef = useRef<any>(null);
  const setSelectedHeaderRowWithRef = useCallback((row: any) => {
    setSelectedHeaderRow(row);
    selectedHeaderRowRef.current = row;
  }, []);

  const resetSubGrids = useCallback(() => {
    setSelectedHeaderRowWithRef(null);
    setDetailRowData(EMPTY_GRID);
  }, [setSelectedHeaderRowWithRef]);

  // 공통 코드
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
    layout,
    setLayout,
    pageSize,
    setPageSize,
    gridData,
    setGridData,
    detailRowData,
    setDetailRowData,
    mainColumnDefs,
    setMainColumnDefs,
    detailColumnDefs,
    setDetailColumnDefs,
    selectedHeaderRow,
    selectedHeaderRowRef,
    setSelectedHeaderRow: setSelectedHeaderRowWithRef,
    resetSubGrids,
    codeMap,
  };
}

export type ApDailyManagementModel = ReturnType<
  typeof useApDailyManagementModel
>;
