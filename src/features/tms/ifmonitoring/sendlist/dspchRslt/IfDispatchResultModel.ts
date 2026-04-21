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

export function useIfDispatchResultModel() {
  const [layout, setLayout] = useState<LayoutType>("side");
  const [pageSize, setPageSize] = useState(500);
  const [gridData, setGridData] = useState<GridData>(EMPTY_GRID);

  const resetSubGrids = useCallback(() => {}, []);

  const { stores } = useCommonStores({
    ifPrcSts: { sqlProp: "CODE", keyParam: "IF_PRC_STS" },
    ifType: { sqlProp: "CODE", keyParam: "IF_TYPE" },
    ordTp: { sqlProp: "CODE", keyParam: "ORD_TP" },
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

export type IfDispatchResultModel = ReturnType<typeof useIfDispatchResultModel>;
