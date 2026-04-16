// src/views/tender/TenderReceiveDispatchModel.ts
// ──────────────────────────────────────────────────────────────────
//  센차 TenderReceiveDispatchModel.js (ViewModel / Store) 대응
//
//  센차에서는 ViewModel의 stores 블록으로 상태를 선언하고
//  proxy URL을 통해 데이터를 로드합니다.
//  React에서는 useState / useRef / useCallback 으로 동일한 역할을 합니다.
//
//  [Sencha store → React state 매핑]
//  mainInfo      → gridData (rows, totalCount, page, limit)
//  sub01Info     → subStopRowData
//  sub04Info     → subSmsHisRowData
//  carrRateInfo  → subApSetlRowData
//  dspchOpStsList→ stores.dspchOpSts  (useCommonStores 처리)
// ──────────────────────────────────────────────────────────────────
import { useState, useRef, useCallback, useMemo } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";

// 배차/정산 상태 컬러맵 (센차: setDispatchOperationStatusColor)
export const DISPATCH_STATUS_COLOR_MAP: Record<string, string> = {
  "2030": "bg-purple-100 text-purple-700",
  "2040": "bg-purple-100 text-purple-700",
  "2050": "bg-purple-100 text-purple-700",
  "2060": "bg-purple-100 text-purple-700",
  "2070": "bg-sky-100 text-sky-700",
  "2073": "bg-sky-100 text-sky-700",
  "2075": "bg-sky-100 text-sky-700",
  "2080": "bg-blue-100 text-blue-700",
  "2090": "bg-blue-100 text-blue-700",
  "2100": "bg-emerald-100 text-emerald-700",
  "2103": "bg-emerald-100 text-emerald-700",
  "2105": "bg-emerald-100 text-emerald-700",
  "2110": "bg-emerald-100 text-emerald-700",
};

export type GridData = {
  rows: any[];
  totalCount: number;
  page: number;
  limit: number;
};

/**
 * useTenderReceiveDispatchModel
 *
 * 센차 ViewModel + Store 를 React hook 으로 대체합니다.
 * - 상태(state)와 ref 만 포함하고 비즈니스 로직은 Controller 에 위임합니다.
 */
export function useCountryModel() {
  // ── 레이아웃 ─────────────────────────────────────────────────
  const [layout, setLayout] = useState<LayoutType>("side");

  // ── 페이징 (센차: pageSize = Util.rowPerPage) ────────────────
  const [pageSize, setPageSize] = useState(20);

  // ── 메인 그리드 데이터 (센차: mainInfo store) ────────────────
  const [gridData, setGridData] = useState<GridData>({
    rows: [],
    totalCount: 0,
    page: 1,
    limit: 20,
  });

  // ── 서브 그리드 데이터 ────────────────────────────────────────
  // 센차: sub01Info store (경유처)
  const [subStateRowData, setSubStateRowData] = useState<any[]>([]);

  // 센차: sub04Info store (SMS 전송이력)
  const [subCityRowData, setSubCityRowData] = useState<any[]>([]);

  const [subZipRowData, setSubZipRowData] = useState<any[]>([]);

  // ── 추적 패널 ────────────────────────────────────────────────
  const [trackOpen, setTrackOpen] = useState(false);
  const [trackRows, setTrackRows] = useState<any[]>([]);

  // ── 선택 행 (센차: selectedRecord) ───────────────────────────
  const [selectedHeaderRow, setSelectedHeaderRow] = useState<any>(null);

  // ── ref: 클로저/setTimeout에서 최신 state 접근용 ──────────────
  // 센차는 getComp()로 언제든 최신 데이터 접근이 가능하지만
  // React에서는 클로저 문제로 ref 를 함께 사용합니다.
  const subApSetlRowDataRef = useRef<any[]>([]);
  const selectedHeaderRowRef = useRef<any>(null);
  const apSetlGridRef = useRef<any>(null);

  //   // setSubApSetlRowData: state + ref 동시 업데이트
  //   const setSubApSetlRowData = useCallback((updater: any) => {
  //     _setSubApSetlRowData((prev) => {
  //       const next = typeof updater === "function" ? updater(prev) : updater;
  //       subApSetlRowDataRef.current = next;
  //       return next;
  //     });
  //   }, []);

  // setSelectedHeaderRow: state + ref 동시 업데이트
  const setSelectedHeaderRowWithRef = useCallback((row: any) => {
    setSelectedHeaderRow(row);
    selectedHeaderRowRef.current = row;
  }, []);

  // ── 서브 그리드 전체 초기화 (센차: Util.gridsReset) ──────────
  const resetSubGrids = useCallback(() => {
    setSubStateRowData([]);
    setSubCityRowData([]);
    setSubZipRowData([]);
    setSelectedHeaderRowWithRef(null);
  }, [setSubZipRowData, setSelectedHeaderRowWithRef]);

  // ── 공통 코드 스토어 (센차: dspchOpStsList, vehTcd 등) ───────
  const { stores } = useCommonStores({
    dspchOpSts: { sqlProp: "CODE", keyParam: "DSPCH_OP_STS" },
    apFiSts: { sqlProp: "CODE", keyParam: "AP_FI_STS" },
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
    // layout
    layout,
    setLayout,
    // paging
    pageSize,
    setPageSize,
    // main grid
    gridData,
    setGridData,
    // sub grids
    subStateRowData,
    subCityRowData,
    subZipRowData,
    // setSubApSetlRowData,
    // subApSetlRowDataRef,
    // track panel
    trackOpen,
    setTrackOpen,
    trackRows,
    setTrackRows,
    // selected row
    selectedHeaderRow,
    setSelectedHeaderRow: setSelectedHeaderRowWithRef,
    selectedHeaderRowRef,
    // refs
    apSetlGridRef,
    // reset
    resetSubGrids,
    // code maps
    codeMap,
  };
}

export type CountryModel = ReturnType<typeof useCountryModel>;
