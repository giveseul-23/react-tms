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

export function useDispatchOperatorCostModel() {
  const [layout, setLayout] = useState<LayoutType>("vertical");
  const [pageSize, setPageSize] = useState(500);

  // 메인 그리드
  const [gridData, setGridData] = useState<GridData>(EMPTY_GRID);

  // 하단 탭 데이터
  const [costDetailRowData, setCostDetailRowData] = useState<any[]>([]);
  const [costFunctionRowData, setCostFunctionRowData] = useState<any[]>([]);
  const [waypointRowData, setWaypointRowData] = useState<any[]>([]);
  const [evidenceRowData, setEvidenceRowData] = useState<any[]>([]);

  // 선택 행
  const [selectedHeaderRow, setSelectedHeaderRow] = useState<any>(null);
  const selectedHeaderRowRef = useRef<any>(null);
  const setSelectedHeaderRowWithRef = useCallback((row: any) => {
    setSelectedHeaderRow(row);
    selectedHeaderRowRef.current = row;
  }, []);

  // 비용상세 선택 행 — 우측 함수 그리드 조회용
  const [selectedCostDetailRow, setSelectedCostDetailRow] = useState<any>(null);

  const resetSubGrids = useCallback(() => {
    setSelectedHeaderRowWithRef(null);
    setCostDetailRowData([]);
    setCostFunctionRowData([]);
    setWaypointRowData([]);
    setEvidenceRowData([]);
    setSelectedCostDetailRow(null);
  }, [setSelectedHeaderRowWithRef]);

  const { stores } = useCommonStores({
    apType: { sqlProp: "CODE", keyParam: "TM_LEGARCY_AP_TP" },
    financialStatus: { sqlProp: "CODE", keyParam: "DSPCH_FI_STS" },
    serviceType: { sqlProp: "CODE", keyParam: "TRF_SVC_TP" },
    pickDropDiv: { sqlProp: "CODE", keyParam: "STOP_TP" },
    schedTcd: { sqlProp: "CODE", keyParam: "SCHED_TCD" },
    dsFiStsList: { sqlProp: "CODE", keyParam: "AP_FI_STS" },
    payTo: { sqlProp: "CODE", keyParam: "PAY_TO" },
    locTp: { sqlProp: "CODE", keyParam: "LOC_TP" },
    calTcd: { sqlProp: "CODE", keyParam: "CAL_TCD" },
    dlySetlSts: { sqlProp: "CODE", keyParam: "DLY_SETL_STS" },
    cnsigType: { sqlProp: "CODE", keyParam: "HARIM_CONSMT_TP" },
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
    costDetailRowData,
    setCostDetailRowData,
    costFunctionRowData,
    setCostFunctionRowData,
    waypointRowData,
    setWaypointRowData,
    evidenceRowData,
    setEvidenceRowData,
    selectedHeaderRow,
    selectedHeaderRowRef,
    setSelectedHeaderRow: setSelectedHeaderRowWithRef,
    selectedCostDetailRow,
    setSelectedCostDetailRow,
    resetSubGrids,
    codeMap,
  };
}

export type DispatchOperatorCostModel = ReturnType<
  typeof useDispatchOperatorCostModel
>;
