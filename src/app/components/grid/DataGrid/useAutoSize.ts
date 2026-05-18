// app/components/grid/useAutoSize.ts
// ag-grid onGridReady / onFirstDataRendered 시점에 컬럼 자동 너비 계산을 트리거.
// autoSize 재실행 effect 는 activeRowData 대신 autoSizeKey 를 dep 으로 사용 —
// 객체 set(조회) 에만 +1 되므로 셀 편집/행 추가 같은 함수형 setter 호출에는
// autoSize 가 재발화하지 않는다 (가로 스크롤 유지).

import { useCallback, useEffect } from "react";
import type {
  ColDef,
  ColGroupDef,
  GridReadyEvent,
  FirstDataRenderedEvent,
} from "ag-grid-community";
import { calcOptimalWidths, applyColumnWidths } from "./autosize";

export function useAutoSize<TRow>({
  disableAutoSize,
  finalColumnDefs,
  activeRowData,
  activeTab,
  autoSizeKey,
  gridApiRef,
  columnOrderRef,
}: {
  disableAutoSize?: boolean;
  finalColumnDefs: (ColDef<TRow> | ColGroupDef<TRow>)[];
  activeRowData: TRow[];
  activeTab: string | null;
  autoSizeKey?: number;
  gridApiRef: React.MutableRefObject<any>;
  columnOrderRef: React.MutableRefObject<string[]>;
}) {
  const runAutoSize = useCallback(
    (api: any, cols: (ColDef<TRow> | ColGroupDef<TRow>)[], rows: TRow[]) => {
      if (disableAutoSize) return;

      const sizableCols = cols.filter(
        (col) => !("headerName" in col && col.headerName === "No"),
      );

      const widthMap = calcOptimalWidths(sizableCols, rows);
      applyColumnWidths(api, widthMap);
    },
    [disableAutoSize],
  );

  const handleFirstDataRendered = useCallback(
    (e: FirstDataRenderedEvent<TRow>) => {
      runAutoSize(e.api, finalColumnDefs, activeRowData);
    },
    [runAutoSize, finalColumnDefs, activeRowData],
  );

  const handleGridReady = useCallback(
    (e: GridReadyEvent<TRow>) => {
      gridApiRef.current = e.api;
      columnOrderRef.current =
        e.api
          .getColumns()
          ?.map((col: any) => col.getColId())
          .filter(Boolean) ?? [];
      if (activeRowData.length > 0) {
        requestAnimationFrame(() => {
          runAutoSize(e.api, finalColumnDefs, activeRowData);
        });
      }
    },
    [runAutoSize, finalColumnDefs, activeRowData, gridApiRef, columnOrderRef],
  );

  useEffect(() => {
    if (disableAutoSize) return;
    const api = gridApiRef.current;
    if (!api || api.isDestroyed?.()) return;
    if (activeRowData.length === 0) return;

    requestAnimationFrame(() => {
      if (api.isDestroyed?.()) return;
      runAutoSize(api, finalColumnDefs, activeRowData);
    });
    // activeRowData 대신 autoSizeKey 를 dep 으로 사용 — 객체 set(조회) 에만 +1 되므로
    // 셀 편집/행 추가 같은 함수형 setter 호출에는 autoSize 가 재발화하지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, autoSizeKey, finalColumnDefs, runAutoSize, disableAutoSize]);

  return { handleGridReady, handleFirstDataRendered };
}
