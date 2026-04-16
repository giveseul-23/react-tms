// ──────────────────────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";

export type GridData = {
  rows: any[];
  totalCount: number;
  page: number;
  limit: number;
};

/**
 *
 * 센차 ViewModel + Store 를 React hook 으로 대체합니다.
 * - 상태(state)와 ref 만 포함하고 비즈니스 로직은 Controller 에 위임합니다.
 */
export function useCurrencyModel() {
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

  // ── 공통 코드 스토어 (센차: dspchOpStsList, vehTcd 등) ───────
  const { stores } = useCommonStores({
    currRdngRcd: { sqlProp: "CODE", keyParam: "CURR_RDNG_RCD" },
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
    codeMap,
  };
}

export type CurrencyModel = ReturnType<typeof useCurrencyModel>;
