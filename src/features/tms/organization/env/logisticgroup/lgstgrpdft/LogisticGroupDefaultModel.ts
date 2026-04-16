import { useState, useRef, useCallback, useMemo } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";

export type GridData = {
  rows: any[];
  totalCount: number;
  page: number;
  limit: number;
};

export function useLogisticGroupDefaultModel() {
  // ── 레이아웃 ─────────────────────────────────────────────────
  const [layout, setLayout] = useState<LayoutType>("side");

  // ── 페이징 (센차: pageSize = Util.rowPerPage) ────────────────
  const [pageSize, setPageSize] = useState(20);

  // ── 메인 그리드 데이터 (센차: mainInfo store) ────────────────
  const [cnfgGrpData, setcnfgGrpData] = useState<GridData>({
    rows: [],
    totalCount: 0,
    page: 1,
    limit: 20,
  });

  // ── 서브 그리드 데이터 ────────────────────────────────────────
  const [subCnfgRowData, setSubCnfgRowData] = useState<GridData>({
    rows: [],
    totalCount: 0,
    page: 1,
    limit: 20,
  });

  const [subDetailRowData, setSubDetailRowData] = useState<GridData>({
    rows: [],
    totalCount: 0,
    page: 1,
    limit: 20,
  });

  // ── 추적 패널 ────────────────────────────────────────────────
  const [trackOpen, setTrackOpen] = useState(false);
  const [trackRows, setTrackRows] = useState<any[]>([]);

  // ── 선택 행 (센차: selectedRecord) ───────────────────────────
  const [selectedHeaderRow, setSelectedHeaderRow] = useState<any>(null);

  const selectedHeaderRowRef = useRef<any>(null);

  // setSelectedHeaderRow: state + ref 동시 업데이트
  const setSelectedHeaderRowWithRef = useCallback((row: any) => {
    setSelectedHeaderRow(row);
    selectedHeaderRowRef.current = row;
  }, []);

  const resetSubGrids = useCallback(() => {
    setSelectedHeaderRow([]);
    setSubCnfgRowData({
      rows: [],
      totalCount: 0,
      page: 1,
      limit: 20,
    });
    setSubDetailRowData({
      rows: [],
      totalCount: 0,
      page: 1,
      limit: 20,
    });
  }, [setSelectedHeaderRowWithRef]);

  return {
    layout,
    setLayout,
    pageSize,
    setPageSize,
    cnfgGrpData,
    subCnfgRowData,
    trackOpen,
    setTrackOpen,
    trackRows,
    setTrackRows,
    selectedHeaderRow,
    subDetailRowData,
    setSubDetailRowData,
    setSelectedHeaderRow,
    resetSubGrids,
    setcnfgGrpData,
    setSubCnfgRowData,
  };
}

export type LogisticGroupDefaultModel = ReturnType<
  typeof useLogisticGroupDefaultModel
>;
