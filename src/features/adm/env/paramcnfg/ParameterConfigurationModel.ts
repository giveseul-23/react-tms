import { useMemo, useState } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";

export type GridData = {
  rows: any[];
  totalCount: number;
  page: number;
  limit: number;
};

export function useParameterConfigurationModel() {
  const [layout, setLayout] = useState<LayoutType>("side");
  const [pageSize, setPageSize] = useState(500);
  const [gridData, setGridData] = useState<GridData>({
    rows: [],
    totalCount: 0,
    page: 1,
    limit: 20,
  });

  const { stores } = useCommonStores({
    cnfgUseTp: { sqlProp: "CODE", keyParam: "CNFG_USE_TP" },
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
    codeMap,
  };
}

export type ParameterConfigurationModel = ReturnType<
  typeof useParameterConfigurationModel
>;
