// src/views/dispatchPlan/DispatchPlanModel.ts
import { useState, useCallback, useMemo } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";

export type GridData = {
  rows: any[];
  totalCount: number;
  page: number;
  limit: number;
};

export function useDispatchPlanModel() {
  // ── 레이아웃 / 페이징 ────────────────────────────────────────
  const [layout, setLayout] = useState<LayoutType>("vertical");
  const [pageSize, setPageSize] = useState(500);

  // ── 메인 그리드 ─────────────────────────────────────────────
  const [gridData, setGridData] = useState<GridData>({
    rows: [],
    totalCount: 0,
    page: 1,
    limit: 500,
  });

  // ── 선택 행 ─────────────────────────────────────────────────
  const [selectedHeaderRow, setSelectedHeaderRow] = useState<any>(null);

  // ── 하단 탭 데이터 ──────────────────────────────────────────
  const [stopRowData, setStopRowData] = useState<any[]>([]);
  const [allocOrderRowData, setAllocOrderRowData] = useState<any[]>([]);
  const [unallocOrderRowData, setUnallocOrderRowData] = useState<any[]>([]);
  // ── 하단 탭 · SUB(품목) 데이터 ──────────────────────────────
  const [allocSubRowData, setAllocSubRowData] = useState<any[]>([]);
  const [unallocSubRowData, setUnallocSubRowData] = useState<any[]>([]);

  // ── 탭 내 조회 중 상태 ─────────────────────────────────────
  const [unallocSearching, setUnallocSearching] = useState(false);

  // ── 서브 그리드 전체 초기화 ─────────────────────────────────
  const resetSubGrids = useCallback(() => {
    setStopRowData([]);
    setAllocOrderRowData([]);
    setUnallocOrderRowData([]);
    setAllocSubRowData([]);
    setUnallocSubRowData([]);
    setSelectedHeaderRow(null);
  }, []);

  // ── 공통 코드 ───────────────────────────────────────────────
  const { stores } = useCommonStores({
    dspchPrgSts: { sqlProp: "CODE", keyParam: "DSPCH_PRG_STS" },
    vehOpTp: { sqlProp: "CODE", keyParam: "VEH_OP_TP" },
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
    selectedHeaderRow,
    setSelectedHeaderRow,
    stopRowData,
    setStopRowData,
    allocOrderRowData,
    setAllocOrderRowData,
    unallocOrderRowData,
    setUnallocOrderRowData,
    allocSubRowData,
    setAllocSubRowData,
    unallocSubRowData,
    setUnallocSubRowData,
    unallocSearching,
    setUnallocSearching,
    resetSubGrids,
    codeMap,
  };
}

export type DispatchPlanModel = ReturnType<typeof useDispatchPlanModel>;
