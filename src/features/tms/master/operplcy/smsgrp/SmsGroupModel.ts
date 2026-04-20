import { useState, useRef, useCallback, useMemo } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";

export type GridData = {
  rows: any[];
  totalCount: number;
  page: number;
  limit: number;
};

export function useSmsGroupModel() {
  // ── 레이아웃 ─────────────────────────────────────────────────
  const [layout, setLayout] = useState<LayoutType>("side");

  // ── 페이징 (센차: pageSize = Util.rowPerPage) ────────────────
  const [pageSize, setPageSize] = useState(500);

  // ── 메인 그리드 데이터 (센차: mainInfo store) ────────────────
  const [gridData, setGridData] = useState<any[]>([]);

  // ── 서브 그리드 데이터 ────────────────────────────────────────
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
    setSubDetailRowData({
      rows: [],
      totalCount: 0,
      page: 1,
      limit: 20,
    });
  }, [setSelectedHeaderRowWithRef]);

  // ── 공통 코드 스토어 (센차: dspchOpStsList, vehTcd 등) ───────
  const { stores } = useCommonStores({
    vltnNtfctnTcd: { sqlProp: "CODE", keyParam: "VLTN_NTFCTN_TCD" },
    ntfctnChnlTcd: { sqlProp: "CODE", keyParam: "NTFCTN_CHNL_TCD" },
  });

  // 코드 → 명칭 변환 맵 (센차: displayField/valueField + onRenderer)
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
    trackOpen,
    setTrackOpen,
    trackRows,
    setTrackRows,
    selectedHeaderRow,
    subDetailRowData,
    setSubDetailRowData,
    setSelectedHeaderRow,
    resetSubGrids,
    codeMap,
  };
}

export type SmsGroupModel = ReturnType<typeof useSmsGroupModel>;
