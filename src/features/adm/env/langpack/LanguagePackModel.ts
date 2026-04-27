import { useState, useMemo } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";

export type GridData = {
  rows: any[];
  totalCount: number;
  page: number;
  limit: number;
};

export function useLanguagePackModel() {
  // ── 레이아웃 ─────────────────────────────────────────────────
  const [layout, setLayout] = useState<LayoutType>("side");

  // ── 페이징 ───────────────────────────────────────────────────
  const [pageSize, setPageSize] = useState(500);

  // ── 메인 그리드 데이터 ───────────────────────────────────────
  const [gridData, setGridData] = useState<GridData>({
    rows: [],
    totalCount: 0,
    page: 1,
    limit: 20,
  });

  // ── 공통 코드 스토어 (언어유형) ─────────────────────────────
  const { stores } = useCommonStores({
    langGbn: { sqlProp: "CODE", keyParam: "LANG_GBN" },
  });

  // 코드 → 명칭 변환 맵
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

export type LanguagePackModel = ReturnType<typeof useLanguagePackModel>;
