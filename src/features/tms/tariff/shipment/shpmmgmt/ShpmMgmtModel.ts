// ────────────────────────────────────────────────────────────────
// [가이드] Model 템플릿
//
// 사용 방법
// 1. 이 파일을 대상 폴더로 복사 후 파일명 교체 (예: FeatureModel.ts)
// 2. 훅 이름 / export 타입 교체 (useXxxModel / XxxModel)
// 3. 필요 없는 state 는 제거, 추가 state 는 자유롭게 확장
//
// 공통 state 목록
// - layout            : "side" | "vertical" — 레이아웃 토글
// - pageSize          : 페이지당 행 개수
// - gridData          : 메인 그리드 데이터 (rows/totalCount/page/limit)
// - subDetailRowData  : 상세 그리드 데이터
// - selectedHeaderRow : 메인에서 선택된 행 (state + ref 동시 보관)
// - codeMap           : 공통코드 → 라벨 lookup 맵
// - trackOpen/Rows    : 추적 패널 (선택)
// ────────────────────────────────────────────────────────────────

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
  limit: 20,
};

export function useShpmMgmtModel() {
  // ── 레이아웃 ──────────────────────────────────────────────────
  const [layout, setLayout] = useState<LayoutType>("side");

  // ── 페이징 ────────────────────────────────────────────────────
  const [pageSize, setPageSize] = useState(20);

  // ── 메인 그리드 ───────────────────────────────────────────────
  const [gridData, setGridData] = useState<GridData>(EMPTY_GRID);

  // ── 상세 그리드 ───────────────────────────────────────────────
  const [subLgstRowData, setSubLgstRowData] = useState<GridData>(EMPTY_GRID);
  const [subZoneRowData, setSubZoneRowData] = useState<GridData>(EMPTY_GRID);
  const [subRateRowData, setSubRateRowData] = useState<GridData>(EMPTY_GRID);
  const [subZoneCondRowData, setSubZoneCondRowData] =
    useState<GridData>(EMPTY_GRID);

  // ── 추적 패널 (선택 기능) ─────────────────────────────────────
  const [trackOpen, setTrackOpen] = useState(false);
  const [trackRows, setTrackRows] = useState<any[]>([]);

  // ── 선택된 행 (state + ref 동시 보관) ─────────────────────────
  // ref 는 Controller 의 onClick 핸들러처럼 stale closure 가 문제되는 곳에서 사용
  const [selectedHeaderRow, setSelectedHeaderRow] = useState<any>(null);
  const selectedHeaderRowRef = useRef<any>(null);
  const setSelectedHeaderRowWithRef = useCallback((row: any) => {
    setSelectedHeaderRow(row);
    selectedHeaderRowRef.current = row;
  }, []);

  // ── 서브 그리드 초기화 유틸 ───────────────────────────────────
  const resetSubGrids = useCallback(() => {
    setSelectedHeaderRowWithRef(null);
    setSubLgstRowData(EMPTY_GRID);
    setSubZoneRowData(EMPTY_GRID);
    setSubRateRowData(EMPTY_GRID);
    setSubZoneCondRowData(EMPTY_GRID);
  }, [setSelectedHeaderRowWithRef]);

  // ── 공통 코드 스토어 (자주 쓰는 lookup) ───────────────────────
  // 사용 예: codeMap.xxxTcd["10"] === "라벨"
  const { stores } = useCommonStores({
    rateRvrsPcd: { sqlProp: "CODE", keyParam: "RATE_RVRS_PCD" },
    itmUom: { sqlProp: "CODE", keyParam: "ITEM_UOM" },
    rngCalcTcd: { sqlProp: "CODE", keyParam: "RNG_CALC_TCD" },
    gnrlLdgrCd: { sqlProp: "CODE", keyParam: "GNRL_LDGR_CD" },
    cstCntrCdList: { sqlProp: "CODE", keyParam: "CST_CNTR_CD" },
    itemApplyList: { sqlProp: "CODE", keyParam: "ITEM_APPLY" },
    operatorTypeList_AndOr: [
      { CODE: "AND", NAME: "AND" },
      { CODE: "OR", NAME: "OR" },
    ],
    calcOptTypeList: [
      { CODE: "=", NAME: "=" },
      { CODE: "!=", NAME: "!=" },
      { CODE: ">", NAME: ">" },
      { CODE: "<", NAME: "<" },
      { CODE: ">=", NAME: ">=" },
      { CODE: "<=", NAME: "<=" },
      { CODE: "BETWEEN", NAME: "BETWEEN" },
      { CODE: "IN", NAME: "IN" },
      { CODE: "ALL_IN", NAME: "ALL_IN" },
      { CODE: "NOT_IN", NAME: "NOT_IN" },
    ],
  });

  // 코드 → 명칭 맵 변환 (Cell Renderer 에서 사용)
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
    // 레이아웃
    layout,
    setLayout,
    // 페이징
    pageSize,
    setPageSize,
    // 그리드 데이터
    gridData,
    setGridData,
    subLgstRowData,
    setSubLgstRowData,
    subZoneRowData,
    setSubZoneRowData,
    subRateRowData,
    setSubRateRowData,
    subZoneCondRowData,
    setSubZoneCondRowData,
    // 선택 행
    selectedHeaderRow,
    selectedHeaderRowRef,
    setSelectedHeaderRow: setSelectedHeaderRowWithRef,
    // 추적 패널
    trackOpen,
    setTrackOpen,
    trackRows,
    setTrackRows,
    // 공통 코드
    codeMap,
    // 유틸
    resetSubGrids,
  };
}

export type ShpmMgmtModel = ReturnType<typeof useShpmMgmtModel>;
