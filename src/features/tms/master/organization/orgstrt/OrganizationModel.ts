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

export function useOrganizationModel() {
  const [layout, setLayout] = useState<LayoutType>("vertical");
  const [pageSize, setPageSize] = useState(500);

  const [divisionGridData, setDivisionGridData] =
    useState<GridData>(EMPTY_GRID);
  const [logisticsGroupRowData, setLogisticsGroupRowData] = useState<any[]>([]);

  const resetSubGrids = useCallback(() => {
    setLogisticsGroupRowData([]);
  }, []);

  const { stores } = useCommonStores({});

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
    divisionGridData,
    setDivisionGridData,
    logisticsGroupRowData,
    setLogisticsGroupRowData,
    resetSubGrids,
    codeMap,
  };
}

export type OrganizationModel = ReturnType<typeof useOrganizationModel>;
