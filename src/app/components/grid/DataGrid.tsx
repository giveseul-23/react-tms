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

import { Lang } from "@/app/services/common/Lang";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

// ─── 오토사이징 유틸 ────────────────────────────────────────────────────────────

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

const CELL_PADDING = 24;
const HEADER_PADDING = 32;
const MIN_COL_WIDTH = 80;

function calcOptimalWidths<TRow>(
  columnDefs: (ColDef<TRow> | ColGroupDef<TRow>)[],
  rowData: TRow[],
): Record<string, number> {
  const widthMap: Record<string, number> = {};

  for (const col of columnDefs) {
    if (!("field" in col) && !("colId" in col)) continue;

    const colDef = col as ColDef<TRow>;
    const key = (colDef.colId ?? colDef.field ?? "") as string;
    if (!key) continue;

    const headerText = colDef.headerName ?? key;
    const headerWidth = measureTextWidth(headerText) + HEADER_PADDING;

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

    widthMap[key] = Math.max(headerWidth, maxDataWidth, MIN_COL_WIDTH);
  }

  return widthMap;
}

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
  onPageSizeChange?: (size: number) => void;
  /** 선택 row 기반 추적 그리드 — 버튼 클릭 시 슬라이드로 표시 */
  onTrack?: (rows: any[]) => React.ReactNode;
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
  onPageSizeChange,
  onTrack,
}: DataGridProps<TRow>) {
  const [selectedRows, setSelectedRows] = useState<TRow[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(
    tabs?.[0]?.key ?? null,
  );
  const [pageSizeInput, setPageSizeInput] = useState<string>(String(pageSize));
  const [pageInput, setPageInput] = useState<string>(String(currentPage ?? 1));
  const [trackContent, setTrackContent] = useState<React.ReactNode>(null);
  const [trackOpen, setTrackOpen] = useState(false);

  // currentPage가 외부에서 바뀌면 input 동기화
  useEffect(() => {
    setPageInput(String(currentPage ?? 1));
  }, [currentPage]);

  useEffect(() => {
    setPageSizeInput(String(pageSize));
  }, [pageSize]);

  const internalGridRef = useRef<any>(null);
  // 드래그/Shift 범위 선택 복사
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const selectedCellsRef = useRef<Set<string>>(new Set());
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ rowIndex: number; colIndex: number } | null>(
    null,
  );
  const columnOrderRef = useRef<string[]>([]);

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
          headerName: Lang.get(col.headerName),
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

      return {
        ...col,
        headerName: Lang.get(col.headerName),
      };
    });
  }, [activeColumnDefs]);

  // ─── 오토사이징 핸들러 ────────────────────────────────────────────────────────

  const runAutoSize = useCallback(
    (api: any, cols: (ColDef<TRow> | ColGroupDef<TRow>)[], rows: TRow[]) => {
      if (disableAutoSize) return;

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

  const gridApiRef = useRef<any>(null);

  const handleGridReady = useCallback(
    (e: GridReadyEvent<TRow>) => {
      gridApiRef.current = e.api;
      // 컬럼 순서 저장 — DOM의 col-id 속성값과 동일한 getColId() 사용
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
    [runAutoSize, finalColumnDefs, activeRowData],
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
  }, [activeTab, activeRowData, finalColumnDefs, runAutoSize, disableAutoSize]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 드래그 범위 선택 + Ctrl+C 복사 (HTML 샘플 방식)
  useEffect(() => {
    const container = gridContainerRef.current;
    if (!container) return;

    function getCellCoords(el: HTMLElement) {
      const cell = el.classList.contains("ag-cell")
        ? el
        : el.closest<HTMLElement>(".ag-cell");
      const row = el.closest<HTMLElement>("[row-index]");
      if (!cell || !row) return null;

      // ag-Grid는 .ag-cell에 col-id 속성을 붙임
      const colId = cell.getAttribute("col-id");
      if (!colId) return null;

      const rowIndex = parseInt(row.getAttribute("row-index") ?? "-1", 10);
      // col-id가 field명 또는 colId명일 수 있으므로 둘 다 indexOf 시도
      let colIndex = columnOrderRef.current.indexOf(colId);
      if (rowIndex < 0 || colIndex < 0) return null;
      return { rowIndex, colIndex };
    }

    function getRangeKeys(
      a: { rowIndex: number; colIndex: number },
      b: { rowIndex: number; colIndex: number },
    ) {
      const keys = new Set<string>();
      for (
        let r = Math.min(a.rowIndex, b.rowIndex);
        r <= Math.max(a.rowIndex, b.rowIndex);
        r++
      ) {
        for (
          let cl = Math.min(a.colIndex, b.colIndex);
          cl <= Math.max(a.colIndex, b.colIndex);
          cl++
        ) {
          keys.add(`${r}:${cl}`);
        }
      }
      return keys;
    }

    function applyHighlight() {
      container.querySelectorAll<HTMLElement>(".ag-cell").forEach((cell) => {
        const coords = getCellCoords(cell);
        if (!coords) return;
        const selected = selectedCellsRef.current.has(
          `${coords.rowIndex}:${coords.colIndex}`,
        );
        cell.style.backgroundColor = selected ? "rgba(59,130,246,0.15)" : "";
        cell.style.outline = selected ? "1px solid rgba(59,130,246,0.5)" : "";
      });
    }

    function tsvFromSelection() {
      const keys = selectedCellsRef.current;
      if (keys.size === 0) return null;
      let minR = Infinity,
        maxR = -Infinity,
        minC = Infinity,
        maxC = -Infinity;
      keys.forEach((k) => {
        const [r, cl] = k.split(":").map(Number);
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
        if (cl < minC) minC = cl;
        if (cl > maxC) maxC = cl;
      });
      const api = gridApiRef.current;
      if (!api) return null;
      // colId → field 매핑 (colId가 field와 다를 수 있음)
      const colIdToField: Record<string, string> = {};
      api.getColumns()?.forEach((col: any) => {
        colIdToField[col.getColId()] = col.getColDef().field ?? col.getColId();
      });

      const lines: string[] = [];
      for (let r = minR; r <= maxR; r++) {
        const node = api.getDisplayedRowAtIndex(r);
        const cells: string[] = [];
        for (let cl = minC; cl <= maxC; cl++) {
          const colId = columnOrderRef.current[cl];
          const field = colIdToField[colId] ?? colId;
          const val = node?.data?.[field];
          cells.push(val != null ? String(val) : "");
        }
        lines.push(cells.join("\t"));
      }
      return lines.join("\n");
    }

    const onMouseDown = (e: MouseEvent) => {
      // 매번 최신 컬럼 순서 갱신 (컬럼 이동/추가 대응)
      const api = gridApiRef.current;
      if (api && !api.isDestroyed?.()) {
        const cols =
          api
            .getColumns()
            ?.map((col: any) => col.getColId())
            .filter(Boolean) ?? [];
        if (cols.length > 0) columnOrderRef.current = cols;
      }

      const cell = (e.target as HTMLElement).closest<HTMLElement>(".ag-cell");
      if (!cell) return;
      const coords = getCellCoords(cell);
      if (!coords) return;

      if (e.shiftKey && dragStartRef.current) {
        selectedCellsRef.current = getRangeKeys(dragStartRef.current, coords);
      } else {
        dragStartRef.current = coords;
        selectedCellsRef.current = new Set([
          `${coords.rowIndex}:${coords.colIndex}`,
        ]);
        isDraggingRef.current = true;
      }
      applyHighlight();
      // e.preventDefault() 제거 — ag-Grid 자체 이벤트(행선택 등) 차단하지 않음
    };

    const onMouseOver = (e: MouseEvent) => {
      if (!isDraggingRef.current || !dragStartRef.current) return;
      const cell = (e.target as HTMLElement).closest<HTMLElement>(".ag-cell");
      if (!cell) return;
      const coords = getCellCoords(cell);
      if (!coords) return;
      selectedCellsRef.current = getRangeKeys(dragStartRef.current, coords);
      applyHighlight();
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onScroll = () => requestAnimationFrame(applyHighlight);

    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key !== "c") return;
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (selectedCellsRef.current.size === 0) return;
      e.preventDefault();
      e.stopPropagation();
      const tsv = tsvFromSelection();
      if (tsv) navigator.clipboard.writeText(tsv).catch(() => {});
    };

    container.addEventListener("mousedown", onMouseDown);
    container.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseup", onMouseUp);
    container.addEventListener("scroll", onScroll, true);
    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);
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

  // onTrack 버튼을 actions 맨 앞에 주입
  const wrappedActionsWithTrack = useMemo(() => {
    if (!onTrack) return wrappedActions;
    const trackAction: ActionItem = {
      type: "button",
      key: "__track__",
      label: "+ 추적",
      onClick: () => {
        const content = onTrack(selectedRows);
        setTrackContent(content);
        setTrackOpen(true);
      },
      disabled: selectedRows.length === 0,
    };
    return [trackAction, ...wrappedActions];
  }, [onTrack, wrappedActions, selectedRows]);

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
    onCellClicked: (_e: any) => {
      // 범위 복사는 마우스 이벤트 + Ctrl+C 로 처리 (아래 useEffect 참조)
    },
    onRowClicked: (e: any) => {
      const target = e.event?.target as HTMLElement;
      // 체크박스 클릭은 체크박스 전용 — 행 클릭 이벤트 스킵
      if (
        target?.closest(".ag-selection-checkbox") ||
        target?.closest(".ag-checkbox") ||
        target?.tagName === "INPUT"
      ) {
        return;
      }
      // Shift 클릭은 셀 복사 용도 — onRowClicked 스킵
      if (e.event?.shiftKey) return;
      if (!e.data) return;
      onRowClicked?.(e.data);
    },
    onCellValueChanged: activeOnCellValueChanged,
    rowSelection:
      rowSelectionProp === "single"
        ? { mode: "singleRow" as const, enableClickSelection: true }
        : {
            mode: "multiRow" as const,
            // 체크박스로만 선택 — 행 클릭으로 체크 안 됨
            enableClickSelection: false,
          },
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

  // ─── 페이지네이션 바 ──────────────────────────────────────────────────────────

  const PaginationBar = () => {
    if (totalCount == null) return null;

    const isEmpty = totalCount === 0;
    const isFirst = isEmpty || currentPage === 1;
    const isLast = isEmpty || currentPage === totalPages;

    const commitPageSize = () => {
      const v = parseInt(pageSizeInput);
      if (!isNaN(v) && v > 0) {
        onPageSizeChange?.(v);
      } else {
        setPageSizeInput(String(pageSize));
      }
    };

    const commitPage = () => {
      const v = parseInt(pageInput);
      if (!isNaN(v) && v >= 1 && v <= (totalPages || 1)) {
        onPageChange?.(v);
      } else {
        setPageInput(String(currentPage ?? 1));
      }
    };

    const btnCls =
      "px-1.5 py-0.5 border border-gray-300 rounded text-[11px] disabled:opacity-40 hover:bg-gray-100 leading-none";

    return (
      <div className="flex items-center gap-2 px-2 py-1 border-t shrink-0 text-[11px] text-gray-600">
        {/* 총 건수 뱃지 */}
        <span className="inline-flex items-center justify-center min-w-[28px] h-5 px-1.5 rounded border border-gray-300 bg-gray-100 font-medium text-gray-700">
          {totalCount.toLocaleString()}
        </span>

        {/* 페이지당 행 개수 */}
        <span className="shrink-0 text-gray-500">페이지당 행 개수:</span>
        <input
          type="number"
          min={1}
          value={pageSizeInput}
          onChange={(e) => setPageSizeInput(e.target.value)}
          onBlur={commitPageSize}
          onKeyDown={(e) => e.key === "Enter" && commitPageSize()}
          className="w-14 h-5 px-1 border border-gray-300 rounded text-center text-[11px] bg-[rgb(var(--bg))]"
        />

        {/* 현재 페이지 */}
        <span className="shrink-0 text-gray-500">현재 페이지:</span>
        <input
          type="number"
          min={1}
          max={totalPages || 1}
          value={pageInput}
          onChange={(e) => setPageInput(e.target.value)}
          onBlur={commitPage}
          onKeyDown={(e) => e.key === "Enter" && commitPage()}
          className="w-10 h-5 px-1 border border-gray-300 rounded text-center text-[11px] bg-[rgb(var(--bg))]"
        />
        <span className="shrink-0 text-gray-500">
          / {isEmpty ? 0 : totalPages} 페이지
        </span>

        {/* 페이지 이동 버튼 — 오른쪽 끝 */}
        <div className="ml-auto flex items-center gap-0.5">
          <button
            disabled={isFirst}
            onClick={() => onPageChange?.(1)}
            className={btnCls}
          >
            {"<<"}
          </button>
          <button
            disabled={isFirst}
            onClick={() => onPageChange?.((currentPage ?? 1) - 1)}
            className={btnCls}
          >
            {"<"}
          </button>
          <button
            disabled={isLast}
            onClick={() => onPageChange?.((currentPage ?? 1) + 1)}
            className={btnCls}
          >
            {">"}
          </button>
          <button
            disabled={isLast}
            onClick={() => onPageChange?.(totalPages)}
            className={btnCls}
          >
            {">>"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={gridContainerRef}
      className="border border-gray-200 rounded-lg bg-[rgb(var(--bg))] flex flex-col h-full min-h-0"
    >
      {layoutType === "tab" && tabs && activeTab && (
        <div className="px-4 shrink-0">
          <GridTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
      )}

      <div className="relative z-1 shrink-0 min-w-0 w-full">
        <GridActionsBar actions={wrappedActionsWithTrack} />
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

      {/* 추적 그리드 — 슬라이드 다운 */}
      {onTrack && (
        <div
          className={`overflow-hidden transition-all duration-400 ease-in-out ${
            trackOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          }`}
          style={{ transitionProperty: "max-height, opacity" }}
        >
          <div className="border-t border-gray-200 mt-1">
            {/* 추적 헤더 */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-gray-800">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                추적 결과
              </span>
              <button
                onClick={() => setTrackOpen(false)}
                className="text-[11px] text-gray-400 hover:text-gray-600 px-2 py-0.5 rounded hover:bg-gray-200 transition-colors"
              >
                닫기
              </button>
            </div>
            <div className="p-2">{trackContent}</div>
          </div>
        </div>
      )}
    </div>
  );
}
