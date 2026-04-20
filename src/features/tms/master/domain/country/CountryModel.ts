// ──────────────────────────────────────────────────────────────────
import { useState, useRef, useCallback, useMemo } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";

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
  const [pageSize, setPageSize] = useState(500);

  // ── 메인 그리드 데이터 (센차: mainInfo store) ────────────────
  const [gridData, setGridData] = useState<GridData>({
    rows: [],
    totalCount: 0,
    page: 1,
    limit: 20,
  });

  // ── 서브 그리드 데이터 ────────────────────────────────────────
  const [subStateRowData, setSubStateRowData] = useState<any[]>([]);
  const [subZipRowData, setSubZipRowData] = useState<any[]>([]);
  const [subCityRowData, setSubCityRowData] = useState<any[]>([]);

  // ── 선택 행 (센차: selectedRecord) ───────────────────────────
  const [selectedHeaderRow, setSelectedHeaderRow] = useState<any>(null);

  // ── ref: 클로저/setTimeout에서 최신 state 접근용 ──────────────
  // 센차는 getComp()로 언제든 최신 데이터 접근이 가능하지만
  // React에서는 클로저 문제로 ref 를 함께 사용합니다.
  const selectedHeaderRowRef = useRef<any>(null);

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
  }, [setSubStateRowData, setSelectedHeaderRowWithRef]);

  // ── 공통 코드 스토어 (센차: dspchOpStsList, vehTcd 등) ───────
  const { stores } = useCommonStores({
    mapTpList: { sqlProp: "CODE", keyParam: "MAP_TP" },
    ctryTzTcdList: { sqlProp: "CODE", keyParam: "CTRY_TZ_TCD" },
    timezoneStore: {
      sqlProp: "/tmsCommonService/searchTimzones",
      keyParam: "",
    },
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
    subStateRowData,
    subCityRowData,
    subZipRowData,
    setSubStateRowData,
    setSubCityRowData,
    setSubZipRowData,
    selectedHeaderRow,
    setSelectedHeaderRow: setSelectedHeaderRowWithRef,
    selectedHeaderRowRef,
    resetSubGrids,
    codeMap,
  };
}

export type CountryModel = ReturnType<typeof useCountryModel>;
