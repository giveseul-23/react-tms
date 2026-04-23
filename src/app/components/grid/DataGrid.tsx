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
import type {
  ColDef,
  ColGroupDef,
  ValueGetterParams,
  GridReadyEvent,
  FirstDataRenderedEvent,
} from "ag-grid-community";

import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

import { GridTabs } from "./GridTabs";
import type { GridPreset, GridTab } from "./types";
import { GridActionsBar, ActionItem } from "@/app/components/ui/GridActionsBar";

import { Lang } from "@/app/services/common/Lang";
import { Util } from "@/app/services/common/Util";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

// ─── 오토사이징 유틸 ────────────────────────────────────────────────────────────

const GRID_FONT =
  "11px Pretendard, -apple-system, BlinkMacSystemFont, sans-serif";
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

/** cellRenderer 가 반환한 React element 에서 텍스트만 추출 */
function extractTextFromElement(element: any): string {
  if (element == null) return "";
  if (typeof element === "string" || typeof element === "number")
    return String(element);
  if (typeof element === "boolean") return "";
  if (element?.props?.children != null) {
    const children = element.props.children;
    if (Array.isArray(children))
      return children.map(extractTextFromElement).join("");
    return extractTextFromElement(children);
  }
  return "";
}

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
      let str: string;

      if ((colDef as any).cellRenderer) {
        // cellRenderer(코드→라벨 등)가 있으면 렌더 결과에서 텍스트 추출
        try {
          const rendered = (colDef as any).cellRenderer({
            value: raw,
            data: row,
          });
          str = extractTextFromElement(rendered) || String(raw ?? "");
        } catch {
          str = raw == null ? "" : String(raw);
        }
      } else if ((colDef as any).valueFormatter) {
        try {
          str =
            (colDef as any).valueFormatter({ value: raw, data: row }) ??
            String(raw ?? "");
        } catch {
          str = raw == null ? "" : String(raw);
        }
      } else {
        str =
          raw == null
            ? ""
            : typeof raw === "object"
              ? JSON.stringify(raw)
              : String(raw);
      }

      const w = measureTextWidth(str) + CELL_PADDING;
      if (w > maxDataWidth) maxDataWidth = w;
    }

    widthMap[key] = Math.max(headerWidth, maxDataWidth, MIN_COL_WIDTH);
  }

  return widthMap;
}

function applyColumnWidths(api: any, widthMap: Record<string, number>) {
  const cols = api.getColumns?.() ?? [];

  for (const col of cols) {
    const colId = col.getColId?.();
    const matched = widthMap[colId];
    if (!colId || !matched) continue;
    api.setColumnWidth(colId, matched);
  }
}

// ─── 컴포넌트 ───────────────────────────────────────────────────────────────────

type DataGridProps<TRow> = {
  tabs?: GridTab[];
  presets?: Record<string, GridPreset<TRow>>;

  rowData?: TRow[] | Record<string, TRow[]>;
  columnDefs?: (ColDef<TRow> | ColGroupDef<TRow>)[];

  layoutType?: "tab" | "plain";
  actions: ActionItem[];
  subTitle?: string;

  pagination?: boolean;

  onRowSelected?: (row: TRow | null) => void;
  onRowClicked?: (row: TRow) => void;
  onRowDoubleClicked?: (row: TRow) => void;
  renderRightGrid?: (activeTabKey: string) => React.ReactNode;
  /** 탭 전환 시 콜백 — 외부에서 activeTab 을 추적할 때 사용 */
  onTabChange?: (key: string) => void;

  disableAutoSize?: boolean;
  rowSelection?: string;

  onCellValueChanged?: (params: any) => void;

  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;

  onTrack?: (rows: any[]) => React.ReactNode;

  // ─── Tree Data 지원 ───────────────────────────────────────────────────────
  treeData?: boolean;
  getDataPath?: (data: TRow) => string[];
  autoGroupColumnDef?: ColDef<TRow>;
  groupDefaultExpanded?: number; // -1: 전체 펼침, 0: 전체 접힘, N: N 레벨까지

  // ─── 공통 코드 → 라벨 매핑 ────────────────────────────────────────────────
  /**
   * 코드 → 라벨 lookup 맵. 컬럼에 codeKey 를 지정하면 해당 맵에서
   * params.value 를 치환해 자동으로 cellRenderer 를 주입합니다.
   * 예: codeMap.xxxTcd["10"] === "라벨"
   */
  codeMap?: Record<string, Record<string, string>>;

  // ─── Escape Hatch ─────────────────────────────────────────────────────────
  /**
   * 외부에서 직접 rowData를 주입합니다.
   * 이 값이 있으면 내부의 activeRowData 계산(탭/프리셋)을 완전히 무시합니다.
   * flat-tree처럼 visibleRows를 외부에서 관리할 때 사용하세요.
   */
  overrideRowData?: TRow[];
  /**
   * AgGridReact에 추가로 전달할 옵션을 오버라이드합니다.
   * commonGridProps보다 나중에 스프레드되어 최종 우선순위를 가집니다.
   * (예: getRowId, suppressMovableColumns, rowClassRules 등)
   */
  gridOptions?: Record<string, any>;

  // ─── renderRightGrid 좌/우 패널 크기 조정 (%) ─────────────────────────────
  /** 메인(좌측) 패널 초기 크기 — 기본 70 */
  mainPanelSize?: number;
  /** 메인(좌측) 패널 최소 크기 — 기본 30 */
  mainPanelMinSize?: number;
  /** 오른쪽 패널(renderRightGrid) 초기 크기 — 기본 30 */
  rightPanelSize?: number;
  /** 오른쪽 패널(renderRightGrid) 최소 크기 — 기본 20 */
  rightPanelMinSize?: number;
};

export default function DataGrid<TRow>({
  tabs,
  presets,
  rowData = [],
  columnDefs = [],
  layoutType = "tab",
  actions,
  subTitle,
  pagination = false,
  pageSize = 500,
  onRowSelected,
  renderRightGrid,
  disableAutoSize,
  onRowClicked,
  onRowDoubleClicked,
  rowSelection: rowSelectionProp,
  onCellValueChanged,
  totalCount,
  currentPage,
  onPageChange,
  onPageSizeChange,
  onTrack,
  treeData,
  getDataPath,
  autoGroupColumnDef,
  groupDefaultExpanded = -1,
  codeMap,
  overrideRowData,
  gridOptions,
  onTabChange,
  mainPanelSize = 70,
  mainPanelMinSize = 30,
  rightPanelSize = 30,
  rightPanelMinSize = 20,
}: DataGridProps<TRow>) {
  const [selectedRows, setSelectedRows] = useState<TRow[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(
    tabs?.[0]?.key ?? null,
  );
  const [pageSizeInput, setPageSizeInput] = useState<string>(String(pageSize));
  const [pageInput, setPageInput] = useState<string>(String(currentPage ?? 1));
  const [trackContent, setTrackContent] = useState<React.ReactNode>(null);
  const [trackOpen, setTrackOpen] = useState(false);

  useEffect(() => {
    setPageInput(String(currentPage ?? 1));
  }, [currentPage]);

  useEffect(() => {
    setPageSizeInput(String(pageSize));
  }, [pageSize]);

  const internalGridRef = useRef<any>(null);
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
    // escape hatch: 외부 rowData 직접 주입
    if (overrideRowData !== undefined) return overrideRowData;
    if (
      layoutType === "tab" &&
      activeTab &&
      rowData &&
      !Array.isArray(rowData)
    ) {
      return rowData[activeTab] ?? [];
    }
    return Array.isArray(rowData) ? rowData : [];
  }, [layoutType, activeTab, rowData, overrideRowData]);

  // summable: true 컬럼의 합계를 pinnedBottomRowData 로 생성
  const summaryRow = useMemo(() => {
    const collectSummable = (cols: any[]): any[] => {
      const out: any[] = [];
      for (const c of cols) {
        if (c?.summable && c.field) out.push(c);
        if (Array.isArray(c?.children)) out.push(...collectSummable(c.children));
      }
      return out;
    };
    const summable = collectSummable(activeColumnDefs as any[]);
    if (summable.length === 0) return undefined;

    const row: Record<string, any> = {};
    for (const col of summable) {
      const field = col.field as string;
      const total = (activeRowData as any[]).reduce((acc: number, r: any) => {
        const v = r?.[field];
        const n =
          typeof v === "number"
            ? v
            : Number(String(v ?? "").replaceAll(",", ""));
        return Number.isNaN(n) ? acc : acc + n;
      }, 0);
      row[field] = total;
    }
    return [row];
  }, [activeColumnDefs, activeRowData]);

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

  const activeOnRowClicked = useMemo(() => {
    if (layoutType === "tab" && activeTab && presets) {
      return presets[activeTab].onRowClicked ?? onRowClicked;
    }
    return onRowClicked;
  }, [layoutType, activeTab, presets, onRowClicked]);

  const activeGridRef = useMemo(() => {
    if (layoutType === "tab" && activeTab && presets) {
      return presets[activeTab].gridRef ?? internalGridRef;
    }
    return internalGridRef;
  }, [layoutType, activeTab, presets]);

  const activeCodeMap = useMemo(() => {
    if (layoutType === "tab" && activeTab && presets) {
      return presets[activeTab].codeMap ?? codeMap;
    }
    return codeMap;
  }, [layoutType, activeTab, presets, codeMap]);

  const activeRender =
    layoutType === "tab" && activeTab && presets
      ? presets[activeTab].render
      : undefined;

  /** No 컬럼 처리 + 자동 정렬 (숫자=우측, _STS=중앙, 기본=좌측) */
  const finalColumnDefs = useMemo(() => {
    // noLang === true 면 원문 그대로, 아니면 Lang.get 적용
    const translate = (col: any): string =>
      col?.noLang ? col.headerName : Lang.get(col.headerName);

    // ColGroupDef 의 children 재귀 변환 (noLang / codeKey / Lang.get)
    const walkChildren = (children: any[] | undefined): any[] | undefined => {
      if (!Array.isArray(children)) return children;
      return children.map((child) => {
        const codeKey = child?.codeKey as string | undefined;
        const withRenderer =
          codeKey && !child.cellRenderer
            ? {
                ...child,
                cellRenderer: (params: any) => {
                  const code = params.value;
                  const label =
                    activeCodeMap?.[codeKey]?.[String(code)] ?? code;
                  return (
                    <span className={`px-2 py-0.5 rounded-lg text-xs`}>
                      {label}
                    </span>
                  );
                },
              }
            : child;
        return {
          ...withRenderer,
          headerName: translate(withRenderer),
          children: walkChildren(withRenderer.children),
        };
      });
    };

    // codeKey 가 있는 컬럼에 자동 cellRenderer 주입 (이미 cellRenderer 있으면 유지)
    const prepared = activeColumnDefs.map((col) => {
      const codeKey = (col as any).codeKey as string | undefined;
      if (!codeKey || (col as any).cellRenderer) return col;
      return {
        ...col,
        cellRenderer: (params: any) => {
          const code = params.value;
          const label = activeCodeMap?.[codeKey]?.[String(code)] ?? code;
          return (
            <span className={`px-2 py-0.5 rounded-lg text-xs`}>{label}</span>
          );
        },
      };
    });

    return prepared.map((col) => {
      if ("headerName" in col && col.headerName === "No") {
        const maxNum = String(activeRowData.length || 1);
        const noWidth = Math.max(
          measureTextWidth("No") + HEADER_PADDING,
          measureTextWidth(maxNum) + CELL_PADDING,
        );
        return {
          ...col,
          headerName: "No",
          width: noWidth,
          minWidth: noWidth,
          maxWidth: noWidth,
          suppressMenu: true,
          sortable: false,
          filter: false,
          floatingFilter: false,
          getQuickFilterText: () => null,
          cellStyle: { textAlign: "center" },
          headerClass: "ag-header-center",
          valueGetter: (params: ValueGetterParams<TRow>) =>
            params.node?.rowPinned === "bottom"
              ? "합계"
              : (params.node?.rowIndex ?? 0) + 1,
        };
      }

      const translatedChildren = walkChildren((col as any).children);

      if ((col as any).disableMaxWidth === true) {
        return {
          ...col,
          maxWidth: null,
          headerName: translate(col),
          ...(translatedChildren ? { children: translatedChildren } : {}),
        };
      }

      const colDef = col as ColDef<TRow>;
      const field = (colDef.field ?? colDef.colId ?? "") as string;

      // DTTM 필드: dateFormatType / timeFormatType 에 따른 자동 포맷팅
      if (field.includes("DTTM")) {
        return {
          ...col,
          headerName: translate(col),
          valueFormatter: (params: any) => Util.formatDttm(params.value),
          ...(translatedChildren ? { children: translatedChildren } : {}),
        };
      }

      // fieldType: "date" 선언 컬럼 → 'YYYY-MM-DD' 로 잘라서 가운데 정렬
      // (DB 타입이 TIMESTAMP 라 풀 타임스탬프로 내려오는 경우 대응)
      if ((colDef as any).fieldType === "date") {
        return {
          ...col,
          headerName: translate(col),
          valueFormatter: (params: any) => {
            const v = params?.value;
            if (v == null || v === "") return "";
            return String(v).slice(0, 10);
          },
          cellStyle: { textAlign: "center" },
          headerClass: "ag-header-center",
          ...(translatedChildren ? { children: translatedChildren } : {}),
        };
      }

      // 이미 cellStyle / type 이 지정된 경우 그대로 존중
      if (!(colDef as any).cellStyle && !(colDef as any).type) {
        // _STS 로 끝나는 상태값 컬럼 → 중앙 정렬
        if (field.endsWith("_STS")) {
          return {
            ...col,
            headerName: translate(col),
            cellStyle: { textAlign: "center" },
            headerClass: "ag-header-center",
            ...(translatedChildren ? { children: translatedChildren } : {}),
          };
        }

        // 숫자 타입 컬럼 → 우측 정렬
        if (
          (colDef as any).dataType === "number" ||
          (colDef as any).cellDataType === "number"
        ) {
          return {
            ...col,
            headerName: translate(col),
            cellStyle: { textAlign: "right" },
            headerClass: "ag-header-right",
            ...(translatedChildren ? { children: translatedChildren } : {}),
          };
        }
      }

      return {
        ...col,
        headerName: translate(col),
        ...(translatedChildren ? { children: translatedChildren } : {}),
      };
    });
  }, [activeColumnDefs, activeCodeMap]);

  // ─── 오토사이징 핸들러 ────────────────────────────────────────────────────────

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

  const gridApiRef = useRef<any>(null);

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

// ─── 드래그 범위 선택 + Ctrl+C 복사 ──────────────────────────────────────────
  useEffect(() => {
    const container = gridContainerRef.current;
    if (!container) return;

    function getCellCoords(el: HTMLElement) {
      const cell = el.classList.contains("ag-cell")
        ? el
        : el.closest<HTMLElement>(".ag-cell");
      const row = el.closest<HTMLElement>("[row-index]");
      if (!cell || !row) return null;

      const colId = cell.getAttribute("col-id");
      if (!colId) return null;

      const rowIndex = parseInt(row.getAttribute("row-index") ?? "-1", 10);
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
      // 선택 범위의 경계(min/max row, col) 계산
      const keys = selectedCellsRef.current;

      // 범위 선택(2개 이상) 시 AG Grid 셀 포커스 아웃라인 제거
      if (keys.size > 1) {
        const api = gridApiRef.current;
        if (api && !api.isDestroyed?.()) {
          api.clearFocusedCell();
        }
      }

      let minR = Infinity,
        maxR = -Infinity,
        minC = Infinity,
        maxC = -Infinity;
      keys.forEach((k) => {
        const [r, c] = k.split(":").map(Number);
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
      });

      // 테마 색상에서 primary RGB 값 읽기
      const primaryRgb = getComputedStyle(document.documentElement)
        .getPropertyValue("--primary")
        .trim(); // e.g. "0 186 237"
      const rgb = primaryRgb.replace(/ /g, ",");
      const bgColor = `rgba(${rgb},0.15)`;
      const borderColor = `rgba(${rgb},0.5)`;

      container.querySelectorAll<HTMLElement>(".ag-cell").forEach((cell) => {
        const coords = getCellCoords(cell);
        if (!coords) return;
        const { rowIndex: r, colIndex: c } = coords;
        const selected = keys.has(`${r}:${c}`);

        if (!selected) {
          cell.style.backgroundColor = "";
          cell.style.boxShadow = "";
          return;
        }

        cell.style.backgroundColor = bgColor;

        // 외곽 테두리만 그리기: 선택 범위의 가장자리 셀만 해당 방향에 선 표시
        const borders: string[] = [];
        if (r === minR) borders.push(`inset 0 1px 0 0 ${borderColor}`);
        if (r === maxR) borders.push(`inset 0 -1px 0 0 ${borderColor}`);
        if (c === minC) borders.push(`inset 1px 0 0 0 ${borderColor}`);
        if (c === maxC) borders.push(`inset -1px 0 0 0 ${borderColor}`);
        cell.style.boxShadow = borders.join(", ");
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
      if (!cell) {
        selectedCellsRef.current = new Set();
        dragStartRef.current = null;
        applyHighlight();
        if (api && !api.isDestroyed?.()) {
          api.clearFocusedCell();
        }
        return;
      }
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

    const onDocumentMouseDown = (e: MouseEvent) => {
      if (!container.contains(e.target as Node)) {
        selectedCellsRef.current = new Set();
        dragStartRef.current = null;
        applyHighlight();
        const api = gridApiRef.current;
        if (api && !api.isDestroyed?.()) {
          api.clearFocusedCell();
        }
      }
    };

    container.addEventListener("mousedown", onMouseDown);
    container.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mousedown", onDocumentMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    container.addEventListener("scroll", onScroll, true);
    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mousedown", onDocumentMouseDown);
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
    columnDefs: finalColumnDefs,
    pinnedBottomRowData: summaryRow,
    defaultColDef: {
      resizable: true,
      sortable: true,
      minWidth: MIN_COL_WIDTH,
      filter: true,
      floatingFilter: true,
    },
    headerHeight: 28,
    rowHeight: 22,
    onGridReady: handleGridReady,
    onFirstDataRendered: handleFirstDataRendered,

    // ─── Tree Data props ───────────────────────────────────────────────────
    ...(treeData && {
      treeData: true,
      getDataPath,
      autoGroupColumnDef,
      groupDefaultExpanded,
    }),

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
    onCellClicked: (_e: any) => {},
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
      activeOnRowClicked?.(e.data);
    },
    onRowDoubleClicked: (e: any) => {
      if (!e.data) return;
      onRowDoubleClicked?.(e.data);
    },
    onCellValueChanged: activeOnCellValueChanged,
    rowSelection:
      rowSelectionProp === "single"
        ? { mode: "singleRow" as const, enableClickSelection: true }
        : {
            mode: "multiRow" as const,
            enableClickSelection: false,
          },
    selectionColumnDef: {
      headerClass: "ag-selection-header-center",
      width: 30,
      minWidth: 30,
      maxWidth: 30,
    },

    // ─── Escape Hatch: 외부 gridOptions 오버라이드 (최종 우선순위) ──────────
    ...gridOptions,
  };

  const gridStyle = {
    ["--ag-font-size" as any]: "11px",
    ["--ag-header-font-size" as any]: "11px",
    ["--ag-row-height" as any]: "22px",
    ["--ag-header-height" as any]: "28px",
    ["--ag-cell-horizontal-padding" as any]: "3px",
    ["--ag-cell-vertical-padding" as any]: "1px",
    ["--ag-grid-size" as any]: "3px",
    ["--ag-checkbox-column-width" as any]: "16px",
  };

  // ─── 페이지네이션 바 ──────────────────────────────────────────────────────────

  const paginationEmpty = totalCount === 0;
  const paginationFirst = paginationEmpty || currentPage === 1;
  const paginationLast = paginationEmpty || currentPage === totalPages;
  const paginationBtnCls =
    "px-1.5 py-0.5 border border-gray-300 rounded text-[11px] disabled:opacity-40 hover:bg-gray-100 leading-none";

  const commitPageSize = useCallback(() => {
    const v = parseInt(pageSizeInput);
    if (!isNaN(v) && v > 0) {
      onPageSizeChange?.(v);
    } else {
      setPageSizeInput(String(pageSize));
    }
  }, [pageSizeInput, pageSize, onPageSizeChange]);

  const commitPage = useCallback(
    (raw?: string) => {
      const v = parseInt(raw ?? pageInput);
      if (!isNaN(v) && v >= 1 && v <= (totalPages || 1)) {
        onPageChange?.(v);
      } else {
        setPageInput(String(currentPage ?? 1));
      }
    },
    [pageInput, totalPages, currentPage, onPageChange],
  );

  return (
    <div
      ref={gridContainerRef}
      className="border border-gray-200 rounded-md bg-[rgb(var(--bg))] flex flex-col h-full min-h-0"
    >
      {layoutType === "tab" && tabs && activeTab && (
        <div className="px-3 shrink-0">
          <GridTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={(k) => {
              setActiveTab(k);
              onTabChange?.(k);
            }}
          />
        </div>
      )}

      {/* rightGrid 가 없을 때: actions 바가 전체 너비를 차지 */}
      {!rightGrid && (
        <div className="relative z-1 shrink-0 min-w-0 w-full">
          <GridActionsBar
            actions={wrappedActionsWithTrack}
            subTitle={subTitle}
          />
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        {activeRender ? (
          activeRender()
        ) : rightGrid ? (
          <PanelGroup direction="horizontal" className="h-full w-full">
            <Panel defaultSize={mainPanelSize} minSize={mainPanelMinSize}>
              <div className="h-full flex flex-col min-h-0 border border-gray-200 rounded-md overflow-hidden bg-[rgb(var(--bg))]">
                {/* rightGrid 가 있을 때: MAIN actions 는 MAIN 패널 내부로 */}
                <div className="relative z-1 shrink-0 min-w-0 w-full">
                  <GridActionsBar
                    actions={wrappedActionsWithTrack}
                    subTitle={subTitle}
                  />
                </div>
                <div
                  className="ag-theme-quartz ag-theme-bridge w-full flex-1 min-h-0"
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
            <Panel defaultSize={rightPanelSize} minSize={rightPanelMinSize}>
              <div className="h-full">{rightGrid}</div>
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

      {totalCount != null && (
        <div className="flex items-center gap-2 px-2 py-1 shrink-0 text-[11px] text-gray-600">
          <span className="inline-flex items-center justify-center min-w-[28px] h-5 px-1.5 rounded border border-gray-300 bg-gray-100 font-medium text-gray-700">
            {totalCount.toLocaleString()}
          </span>

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

          <span className="shrink-0 text-gray-500">현재 페이지:</span>
          <input
            type="number"
            min={1}
            max={totalPages || 1}
            value={pageInput}
            onChange={(e) => {
              setPageInput(e.target.value);
              commitPage(e.target.value);
            }}
            className="w-10 h-5 px-1 border border-gray-300 rounded text-center text-[11px] bg-[rgb(var(--bg))]"
          />
          <span className="shrink-0 text-gray-500">
            / {paginationEmpty ? 0 : totalPages} 페이지
          </span>

          <div className="ml-auto flex items-center gap-0.5">
            <button
              disabled={paginationFirst}
              onClick={() => onPageChange?.(1)}
              className={paginationBtnCls}
            >
              <ChevronFirst className="w-3 h-3" />
            </button>
            <button
              disabled={paginationFirst}
              onClick={() => onPageChange?.((currentPage ?? 1) - 1)}
              className={paginationBtnCls}
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              disabled={paginationLast}
              onClick={() => onPageChange?.((currentPage ?? 1) + 1)}
              className={paginationBtnCls}
            >
              <ChevronRight className="w-3 h-3" />
            </button>
            <button
              disabled={paginationLast}
              onClick={() => onPageChange?.(totalPages)}
              className={paginationBtnCls}
            >
              <ChevronLast className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {onTrack && (
        <div
          className={`overflow-hidden transition-all duration-400 ease-in-out ${
            trackOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          }`}
          style={{ transitionProperty: "max-height, opacity" }}
        >
          <div className="mt-1">
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
