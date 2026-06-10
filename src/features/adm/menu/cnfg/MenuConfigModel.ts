// src/views/menu/MenuConfigModel.ts
import { useState, useRef, useCallback, useMemo } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import type { MenuRow } from "./MenuConfig";

export function useMenuConfigModel() {
  // ── 레이아웃
  const [layout, setLayout] = useState<LayoutType>("side");

  // ── 트리 SOURCE (buildSource 결과 flat 배열)
  // 조회 전: [] / 조회 후: buildSource(serverData) 결과
  const [source, setSource] = useState<MenuRow[]>([]);

  // ── 선택 행
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const selectedRowRef = useRef<any>(null);

  const setSelectedRowWithRef = useCallback((row: any) => {
    setSelectedRow(row);
    selectedRowRef.current = row;
  }, []);

  // ── 공통 코드 스토어 (조회조건 콤보 옵션)
  const { codeMap } = useCommonStores({
    useYn: { sqlProp: "CODE", keyParam: "USE_YN" },
    leafYn: { sqlProp: "CODE", keyParam: "LEAF_YN" },
  });

  return {
    layout,
    setLayout,
    source,
    setSource,
    selectedRow,
    setSelectedRow: setSelectedRowWithRef,
    selectedRowRef,
    codeMap,
  };
}

export type MenuConfigModel = ReturnType<typeof useMenuConfigModel>;
