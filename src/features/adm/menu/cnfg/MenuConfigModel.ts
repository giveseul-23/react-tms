// src/views/menu/MenuConfigModel.ts
import { useState, useRef, useCallback, useMemo } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import type { MenuRow } from "./MenuConfig";

export type GridData = {
  rows: any[];
  totalCount: number;
  page: number;
  limit: number;
};

export function useMenuConfigModel() {
  // ── 레이아웃
  const [layout, setLayout] = useState<LayoutType>("side");

  // ── 트리 SOURCE (buildSource 결과 flat 배열)
  // 조회 전: [] / 조회 후: buildSource(serverData) 결과
  const [source, setSource] = useState<MenuRow[]>([]);

  // ── 메인 그리드 데이터 (서버 원본 — 엑셀 등에서 사용)
  const [gridData, setGridData] = useState<GridData>({
    rows: [],
    totalCount: 0,
    page: 1,
    limit: 20,
  });

  // ── 선택 행
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const selectedRowRef = useRef<any>(null);

  const setSelectedRowWithRef = useCallback((row: any) => {
    setSelectedRow(row);
    selectedRowRef.current = row;
  }, []);

  // ── 공통 코드 스토어 (조회조건 콤보 옵션)
  const { stores } = useCommonStores({
    useYn: { sqlProp: "CODE", keyParam: "USE_YN" },
    leafYn: { sqlProp: "CODE", keyParam: "LEAF_YN" },
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
    source,
    setSource,
    gridData,
    setGridData,
    selectedRow,
    setSelectedRow: setSelectedRowWithRef,
    selectedRowRef,
    stores,
    codeMap,
  };
}

export type MenuConfigModel = ReturnType<typeof useMenuConfigModel>;
