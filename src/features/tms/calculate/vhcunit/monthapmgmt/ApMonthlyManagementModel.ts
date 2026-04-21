import { useState, useCallback, useMemo } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";

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

  const resetSubGrids = useCallback(() => {
    // 단일 그리드 — 초기화 없음
  }, []);

  const { stores } = useCommonStores({
    setlPrgSts: { sqlProp: "CODE", keyParam: "SETL_PRG_STS" },
    editSts: { sqlProp: "CODE", keyParam: "EDIT_STS" },
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
    resetSubGrids,
    codeMap,
  };
}

export type ApMonthlyManagementModel = ReturnType<typeof useApMonthlyManagementModel>;
