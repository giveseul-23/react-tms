import { useState, useRef, useCallback, useMemo } from "react";
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

export function useDepartArrivalManagementModel() {
  const [layout, setLayout] = useState<LayoutType>("vertical");
  const [pageSize, setPageSize] = useState(500);

  const [gridData, setGridData] = useState<GridData>(EMPTY_GRID);
  const [stopoverRowData, setStopoverRowData] = useState<any[]>([]);
  const [assignedOrderRowData, setAssignedOrderRowData] = useState<any[]>([]);

  const [selectedHeaderRow, setSelectedHeaderRow] = useState<any>(null);
  const selectedHeaderRowRef = useRef<any>(null);
  const setSelectedHeaderRowWithRef = useCallback((row: any) => {
    setSelectedHeaderRow(row);
    selectedHeaderRowRef.current = row;
  }, []);

  const resetSubGrids = useCallback(() => {
    setSelectedHeaderRowWithRef(null);
    setStopoverRowData([]);
    setAssignedOrderRowData([]);
  }, [setSelectedHeaderRowWithRef]);

  const { stores } = useCommonStores({
    dspchPrgsSts: { sqlProp: "CODE", keyParam: "DSPCH_PRGS_STS" },
    vehTpList: { sqlProp: "CODE", keyParam: "VEH_TP" },
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
    stopoverRowData,
    setStopoverRowData,
    assignedOrderRowData,
    setAssignedOrderRowData,
    selectedHeaderRow,
    selectedHeaderRowRef,
    setSelectedHeaderRow: setSelectedHeaderRowWithRef,
    resetSubGrids,
    codeMap,
  };
}

export type DepartArrivalManagementModel = ReturnType<
  typeof useDepartArrivalManagementModel
>;
