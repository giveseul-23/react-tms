"use client";
// app/components/grid/DataGrid.tsx

import React, {
  useMemo,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);
import type {
  ColDef,
  ColGroupDef,
  ValueGetterParams,
  GridReadyEvent,
  FirstDataRenderedEvent,
} from "ag-grid-community";

import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

import { GridTabs } from "./GridTabs";
import type { GridPreset, GridTab } from "./types";
import { GridActionsBar, ActionItem } from "@/app/components/ui/GridActionsBar";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

// ─── 오토사이징 유틸 ────────────────────────────────────────────────────────────

/**
 * Canvas를 이용해 문자열의 픽셀 너비를 측정합니다.
 * 그리드 폰트(11px)에 맞게 고정합니다.
 */
const GRID_FONT = "11px -apple-system, BlinkMacSystemFont, sans-serif";
let _canvas: HTMLCanvasElement | null = null;

function measureTextWidth(text: string): number {
  if (typeof document === "undefined") return text.length * 7;
  if (!_canvas) _canvas = document.createElement("canvas");
  const ctx = _canvas.getContext("2d");
  if (!ctx) return text.length * 7;
  ctx.font = GRID_FONT;
  return ctx.measureText(text).width;
}

const CELL_PADDING = 10; // 셀 양쪽 패딩 (3px × 2 + 여유)
const HEADER_PADDING = 20; // 헤더 패딩 + 정렬 아이콘 여유
const MIN_COL_WIDTH = 80;

/**
 * rowData와 columnDefs를 받아 각 컬럼의 최적 너비를 계산합니다.
 * - 헤더 텍스트 너비와 데이터 최대 너비 중 큰 값을 사용
 * - 최소 MIN_COL_WIDTH 보장
 */
function calcOptimalWidths<TRow>(
  columnDefs: (ColDef<TRow> | ColGroupDef<TRow>)[],
  rowData: TRow[],
): Record<string, number> {
  const widthMap: Record<string, number> = {};

  for (const col of columnDefs) {
    // ColGroupDef는 field가 없으므로 스킵
    if (!("field" in col) && !("colId" in col)) continue;

    const colDef = col as ColDef<TRow>;
    const key = (colDef.colId ?? colDef.field ?? "") as string;
    if (!key) continue;

    // 헤더 최소 너비
    const headerText = colDef.headerName ?? key;
    const headerWidth = measureTextWidth(headerText) + HEADER_PADDING;

    // 데이터 최대 너비
    let maxDataWidth = 0;
    for (const row of rowData) {
      const raw = (row as any)[colDef.field as string];
      const str =
        raw == null
          ? ""
          : typeof raw === "object"
            ? JSON.stringify(raw)
            : String(raw);
      const w = measureTextWidth(str) + CELL_PADDING;
      if (w > maxDataWidth) maxDataWidth = w;
    }

    // 헤더 vs 데이터 중 큰 값, 최소 MIN_COL_WIDTH
    widthMap[key] = Math.max(headerWidth, maxDataWidth, MIN_COL_WIDTH);
  }

  return widthMap;
}

/**
 * ag-Grid API를 통해 각 컬럼에 계산된 너비를 적용합니다.
 * disableMaxWidth 플래그가 있는 컬럼은 maxWidth 제한 없이 처리합니다.
 */
function applyColumnWidths<TRow>(
  api: any,
  columnDefs: (ColDef<TRow> | ColGroupDef<TRow>)[],
  widthMap: Record<string, number>,
) {
  const updatedDefs = columnDefs.map((col) => {
    if (!("field" in col) && !("colId" in col)) return col;
    const colDef = col as ColDef<TRow>;
    const key = (colDef.colId ?? colDef.field ?? "") as string;
    const width = widthMap[key];
    if (!width) return col;

    const base = { ...colDef, width };

    // disableMaxWidth 플래그가 있으면 maxWidth 제한 제거
    if ((colDef as any).disableMaxWidth === true) {
      return { ...base, maxWidth: undefined };
    }

    return base;
  });

  api.setGridOption("columnDefs", updatedDefs);
}

// ─── 컴포넌트 ───────────────────────────────────────────────────────────────────

type DataGridProps<TRow> = {
  tabs?: GridTab[];
  presets?: Record<string, GridPreset<TRow>>;

  rowData?: TRow[] | Record<string, TRow[]>;
  columnDefs?: (ColDef<TRow> | ColGroupDef<TRow>)[];

  layoutType?: "tab" | "plain";
  actions: ActionItem[];

  pagination?: boolean;

  onRowSelected?: (row: TRow | null) => void;
  onRowClicked?: (row: TRow) => void;
  renderRightGrid?: (activeTabKey: string) => React.ReactNode;

  disableAutoSize?: boolean;
  rowSelection?: string;

  onCellValueChanged?: (params: any) => void;

  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
};

export default function DataGrid<TRow>({
  tabs,
  presets,
  rowData = [],
  columnDefs = [],
  layoutType = "tab",
  actions,
  pagination = false,
  pageSize = 20,
  onRowSelected,
  renderRightGrid,
  disableAutoSize,
  onRowClicked,
  rowSelection: rowSelectionProp,
  onCellValueChanged,
  totalCount,
  currentPage,
  onPageChange,
}: DataGridProps<TRow>) {
  const [selectedRows, setSelectedRows] = useState<TRow[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(
    tabs?.[0]?.key ?? null,
  );

  const internalGridRef = useRef<any>(null);

  const totalPages = Math.ceil((totalCount ?? 0) / (pageSize ?? 20));

  const activeColumnDefs = useMemo(() => {
    if (layoutType === "tab" && activeTab && presets) {
      return presets[activeTab].columnDefs;
    }
    return columnDefs;
  }, [layoutType, activeTab, presets, columnDefs]);

  const activeRowData = useMemo(() => {
    if (
      layoutType === "tab" &&
      activeTab &&
      rowData &&
      !Array.isArray(rowData)
    ) {
      return rowData[activeTab] ?? [];
    }
    return Array.isArray(rowData) ? rowData : [];
  }, [layoutType, activeTab, rowData]);

  const activeActions = useMemo(() => {
    if (layoutType === "tab" && activeTab && presets) {
      return presets[activeTab].actions ?? actions ?? [];
    }
    return actions ?? [];
  }, [layoutType, activeTab, presets, actions]);

  const activeOnCellValueChanged = useMemo(() => {
    if (layoutType === "tab" && activeTab && presets) {
      return presets[activeTab].onCellValueChanged ?? onCellValueChanged;
    }
    return onCellValueChanged;
  }, [layoutType, activeTab, presets, onCellValueChanged]);

  const activeGridRef = useMemo(() => {
    if (layoutType === "tab" && activeTab && presets) {
      return presets[activeTab].gridRef ?? internalGridRef;
    }
    return internalGridRef;
  }, [layoutType, activeTab, presets]);

  /** No 컬럼 처리 */
  const finalColumnDefs = useMemo(() => {
    return activeColumnDefs.map((col) => {
      if ("headerName" in col && col.headerName === "No") {
        return {
          ...col,
          width: 56,
          suppressMenu: true,
          sortable: false,
          filter: false,
          floatingFilter: false,
          getQuickFilterText: () => null,
          valueGetter: (params: ValueGetterParams<TRow>) =>
            (params.node?.rowIndex ?? 0) + 1,
        };
      }

      if ((col as any).disableMaxWidth === true) {
        return {
          ...col,
          maxWidth: null,
        };
      }

      return col;
    });
  }, [activeColumnDefs]);

  // ─── 오토사이징 핸들러 ────────────────────────────────────────────────────────

  /**
   * 데이터 기준 최적 너비를 계산해 컬럼에 적용합니다.
   * disableAutoSize prop이 true면 아무것도 하지 않습니다.
   */
  const runAutoSize = useCallback(
    (api: any, cols: (ColDef<TRow> | ColGroupDef<TRow>)[], rows: TRow[]) => {
      if (disableAutoSize) return;

      // "No" 컬럼은 너비 고정(56px)이므로 오토사이징 대상에서 제외
      const sizableCols = cols.filter(
        (col) => !("headerName" in col && col.headerName === "No"),
      );

      const widthMap = calcOptimalWidths(sizableCols, rows);
      applyColumnWidths(api, cols, widthMap);
    },
    [disableAutoSize],
  );

  const handleFirstDataRendered = useCallback(
    (e: FirstDataRenderedEvent<TRow>) => {
      runAutoSize(e.api, finalColumnDefs, activeRowData);
    },
    [runAutoSize, finalColumnDefs, activeRowData],
  );

  // 그리드 API를 ref에 저장해두고 탭 전환 시 재사용
  const gridApiRef = useRef<any>(null);

  const handleGridReady = useCallback(
    (e: GridReadyEvent<TRow>) => {
      gridApiRef.current = e.api;
      if (activeRowData.length > 0) {
        requestAnimationFrame(() => {
          runAutoSize(e.api, finalColumnDefs, activeRowData);
        });
      }
    },
    [runAutoSize, finalColumnDefs, activeRowData],
  );

  // 탭 전환 또는 rowData 교체 시 저장된 API로 오토사이징 재실행
  useEffect(() => {
    if (disableAutoSize) return;
    const api = gridApiRef.current;
    if (!api || api.isDestroyed?.()) return;
    if (activeRowData.length === 0) return;

    requestAnimationFrame(() => {
      if (api.isDestroyed?.()) return;
      runAutoSize(api, finalColumnDefs, activeRowData);
    });
  }, [activeTab, activeRowData, finalColumnDefs, runAutoSize, disableAutoSize]);

  // ─────────────────────────────────────────────────────────────────────────────

  const wrappedActions = useMemo(() => {
    return activeActions?.map((action) => {
      if (action.type === "button") {
        return {
          ...action,
          onClick: () => action.onClick?.({ data: selectedRows }),
        };
      }
      if (action.type === "group") {
        return {
          ...action,
          items: action.items.map((item) => ({
            ...item,
            onClick: () => item.onClick?.({ data: selectedRows }),
          })),
        };
      }
      return action;
    });
  }, [activeActions, selectedRows]);

  const rightGrid =
    layoutType === "tab" && activeTab && renderRightGrid
      ? renderRightGrid(activeTab)
      : null;

  const commonGridProps = {
    theme: "legacy" as const,
    columnDefs: finalColumnDefs,
    defaultColDef: {
      resizable: true,
      sortable: true,
      minWidth: MIN_COL_WIDTH,
      filter: true,
      floatingFilter: true,
    },
    headerHeight: 22,
    rowHeight: 22,
    onGridReady: handleGridReady,
    onFirstDataRendered: handleFirstDataRendered,
    onRowSelected: (e: any) => {
      if (!e.api) return;
      const rows = e.api.getSelectedRows();
      setSelectedRows(rows);
      if (e.node.isSelected() && e.data) {
        onRowSelected?.(e.data);
      } else {
        setTimeout(() => {
          if (e.api.getSelectedRows().length === 0) {
            onRowSelected?.(null);
          }
        }, 0);
      }
    },
    onRowClicked: (e: any) => {
      const target = e.event?.target as HTMLElement;
      if (
        target?.closest(".ag-selection-checkbox") ||
        target?.closest(".ag-checkbox") ||
        target?.tagName === "INPUT"
      ) {
        return;
      }
      if (e.event?.shiftKey) return;
      if (!e.data) return;
      onRowClicked?.(e.data);
    },
    onCellValueChanged: activeOnCellValueChanged,
    rowSelection:
      rowSelectionProp === "single"
        ? { mode: "singleRow" as const, enableClickSelection: true }
        : { mode: "multiRow" as const },
  };

  const gridStyle = {
    ["--ag-font-size" as any]: "11px",
    ["--ag-header-font-size" as any]: "11px",
    ["--ag-row-height" as any]: "22px",
    ["--ag-header-height" as any]: "22px",
    ["--ag-cell-horizontal-padding" as any]: "3px",
    ["--ag-cell-vertical-padding" as any]: "1px",
    ["--ag-grid-size" as any]: "3px",
  };

  const PaginationBar = () => {
    if (totalCount == null) return null;

    const isEmpty = totalCount === 0;
    const isFirst = isEmpty || currentPage === 1;
    const isLast = isEmpty || currentPage === totalPages;

    return (
      <div className="flex items-center justify-center gap-2 py-1 border-t shrink-0 text-xs">
        <button
          disabled={isFirst}
          onClick={() => onPageChange?.(1)}
          className="px-2 py-0.5 border rounded disabled:opacity-40 hover:bg-gray-100"
        >
          «
        </button>
        <button
          disabled={isFirst}
          onClick={() => onPageChange?.((currentPage ?? 1) - 1)}
          className="px-2 py-0.5 border rounded disabled:opacity-40 hover:bg-gray-100"
        >
          ‹
        </button>
        <span className="text-gray-600">
          {isEmpty ? "0 / 0" : `${currentPage} / ${totalPages}`}
        </span>
        <button
          disabled={isLast}
          onClick={() => onPageChange?.((currentPage ?? 1) + 1)}
          className="px-2 py-0.5 border rounded disabled:opacity-40 hover:bg-gray-100"
        >
          ›
        </button>
        <button
          disabled={isLast}
          onClick={() => onPageChange?.(totalPages)}
          className="px-2 py-0.5 border rounded disabled:opacity-40 hover:bg-gray-100"
        >
          »
        </button>
        <span className="text-gray-400">
          (총 {totalCount.toLocaleString()}건)
        </span>
      </div>
    );
  };

  return (
    <div className="border border-gray-200 rounded-xl bg-[rgb(var(--bg))] flex flex-col h-full min-h-0">
      {layoutType === "tab" && tabs && activeTab && (
        <div className="px-4 shrink-0">
          <GridTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
      )}

      <div className="relative z-1 shrink-0 min-w-0 w-full">
        <GridActionsBar actions={wrappedActions} />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {rightGrid ? (
          <PanelGroup direction="horizontal" className="h-full w-full">
            <Panel defaultSize={70} minSize={30}>
              <div className="h-full">
                <div
                  className="ag-theme-quartz ag-theme-bridge w-full h-full"
                  style={gridStyle}
                >
                  <AgGridReact<TRow>
                    ref={activeGridRef}
                    {...commonGridProps}
                    rowData={activeRowData}
                  />
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="w-2 cursor-col-resize hover:bg-slate-200/70" />

            <Panel defaultSize={30} minSize={20}>
              <div className="h-full border-l border-gray-200">{rightGrid}</div>
            </Panel>
          </PanelGroup>
        ) : (
          <div
            className="ag-theme-quartz ag-theme-bridge w-full h-full"
            style={gridStyle}
          >
            <AgGridReact<TRow>
              ref={activeGridRef}
              {...commonGridProps}
              rowData={activeRowData}
            />
          </div>
        )}
      </div>

      <PaginationBar />
    </div>
  );
}
