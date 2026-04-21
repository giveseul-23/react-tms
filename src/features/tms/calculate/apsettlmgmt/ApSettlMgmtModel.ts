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

export function useApSettlMgmtModel() {
  const [layout, setLayout] = useState<LayoutType>("vertical");
  const [pageSize, setPageSize] = useState(500);

  const [gridData, setGridData] = useState<GridData>(EMPTY_GRID);

  // 종합내역
  const [summaryRowData, setSummaryRowData] = useState<any[]>([]);
  const [monthlyFareRowData, setMonthlyFareRowData] = useState<any[]>([]);
  const [hireDispatchPayRowData, setHireDispatchPayRowData] = useState<any[]>(
    [],
  );
  const [freightPayRowData, setFreightPayRowData] = useState<any[]>([]);
  const [indirectPayRowData, setIndirectPayRowData] = useState<any[]>([]);

  // 코스트센터
  const [costCenterRowData, setCostCenterRowData] = useState<any[]>([]);
  // 원재료비
  const [materialCostRowData, setMaterialCostRowData] = useState<any[]>([]);
  // 증빙문서
  const [evidenceRowData, setEvidenceRowData] = useState<any[]>([]);

  const [selectedHeaderRow, setSelectedHeaderRow] = useState<any>(null);
  const selectedHeaderRowRef = useRef<any>(null);
  const setSelectedHeaderRowWithRef = useCallback((row: any) => {
    setSelectedHeaderRow(row);
    selectedHeaderRowRef.current = row;
  }, []);

  const resetSubGrids = useCallback(() => {
    setSelectedHeaderRowWithRef(null);
    setSummaryRowData([]);
    setMonthlyFareRowData([]);
    setHireDispatchPayRowData([]);
    setFreightPayRowData([]);
    setIndirectPayRowData([]);
    setCostCenterRowData([]);
    setMaterialCostRowData([]);
    setEvidenceRowData([]);
  }, [setSelectedHeaderRowWithRef]);

  const { stores } = useCommonStores({
    apSetlDetailType: { sqlProp: "CODE", keyParam: "AP_SETL_DTL_TCD" },
    apSetlDescType: { sqlProp: "CODE", keyParam: "APPLD_VAL_TCD" },
    fiSts: { sqlProp: "CODE", keyParam: "AP_FI_STS" },
    costCenter: { sqlProp: "CODE", keyParam: "CST_CNTR_GL_RC_TCD" },
    cstDistSts: { sqlProp: "CODE", keyParam: "CST_DIST_STS" },
    cstCntrCd: { sqlProp: "selectCstCntrCodeName" },
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
    summaryRowData,
    setSummaryRowData,
    monthlyFareRowData,
    setMonthlyFareRowData,
    hireDispatchPayRowData,
    setHireDispatchPayRowData,
    freightPayRowData,
    setFreightPayRowData,
    indirectPayRowData,
    setIndirectPayRowData,
    costCenterRowData,
    setCostCenterRowData,
    materialCostRowData,
    setMaterialCostRowData,
    evidenceRowData,
    setEvidenceRowData,
    selectedHeaderRow,
    selectedHeaderRowRef,
    setSelectedHeaderRow: setSelectedHeaderRowWithRef,
    resetSubGrids,
    codeMap,
  };
}

export type ApSettlMgmtModel = ReturnType<typeof useApSettlMgmtModel>;
