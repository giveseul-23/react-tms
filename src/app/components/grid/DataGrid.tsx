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
import {
  processColumnDef,
  wrapActions,
  withRowStatusTracking,
} from "./gridCommon";
import { standardAudit } from "./commonColumns";

// (Note: Util.formatDttm 등 컬럼 변환 관련 유틸은 gridUtils/processColumn 으로 이동.)

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
  const updates: Array<{ key: string; newWidth: number }> = [];

  for (const col of cols) {
    const colId = col.getColId?.();
    const matched = widthMap[colId];
    if (!colId || !matched) continue;
    updates.push({ key: colId, newWidth: matched });
  }
  if (updates.length > 0) api.setColumnWidths?.(updates);
}

// ─── 컴포넌트 ───────────────────────────────────────────────────────────────────

type DataGridProps<TRow> = {
  tabs?: GridTab[];
  presets?: Record<string, GridPreset<TRow>>;

  rowData?: TRow[] | Record<string, TRow[]>;
  columnDefs?: (ColDef<TRow> | ColGroupDef<TRow>)[];

  layoutType?: "tab" | "plain";
  /** 그리드별 액션 버튼들. 비거나 생략하면 actions 바 자체 숨김. */
  actions?: ActionItem[];
  subTitle?: string;

  pagination?: boolean;

  onRowSelected?: (row: TRow | null) => void;
  onRowClicked?: (row: TRow) => void;
  onRowDoubleClicked?: (row: TRow) => void;
  /** rowData 갱신 시 자동으로 행을 선택해 onRowClicked 를 발화. 이전 선택이 있으면 rowKeys 로 매칭, 없으면 첫 표시 행. */
  autoSelectFirstRow?: boolean;
  /** autoSelectFirstRow 의 이전 선택 매칭에 사용할 키 컬럼(들). 미지정 시 항상 첫 표시 행. */
  rowKeys?: string | string[];
  renderRightGrid?: (activeTabKey: string) => React.ReactNode;
  /** 탭 전환 시 콜백 — 외부에서 activeTab 을 추적할 때 사용 */
  onTabChange?: (key: string) => void;

  disableAutoSize?: boolean;
  rowSelection?: string;
  /** false 명시 시 selection column(체크박스/헤더체크박스) 숨김. 미지정 시 기존 동작 유지. */
  headerCheckbox?: boolean;
  /** 변할 때만 autoSize 재실행. model.bind() 가 자동 spread — 객체 set(조회 결과 도착)에만 +1,
   *  함수형 updater(셀 편집/행 추가)는 변경 없음 → 셀 편집 시 가로 스크롤 유지. */
  autoSizeKey?: number;

  onCellValueChanged?: (params: any) => void;
  /** ag-grid 의 selection 이 사용자 액션으로 변경될 때 호출 — model 측 selectedRef 동기화용.
   *  rowDataChanged/api/gridInitializing 등 자동 이벤트는 발화 안 함. */
  onSelectionChanged?: (row: any | null) => void;
  /** controller 가 setSelected(row) 로 박은 행을 ag-grid 시각 선택으로 자동 반영.
   *  model.bind() 가 자동 spread — view 에서 따로 줄 필요 없음. */
  selectedRow?: any;

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

  // ─── Audit 컬럼 자동 추가 ────────────────────────────────────────────────
  /**
   * columnDefs 끝에 standardAudit 자동 spread.
   *   true       — 모두 ON (delete/rowStatus/insertPerson/insertDate/updatePerson/updateTime)
   *   false      — 자동 추가 안 함
   *   undefined  — 자동 추가 안 함 (기존 화면 호환)
   *   객체       — 부분 토글 (예: { updatePerson: false })
   * model.bind() 가 자동으로 audit:true + setRowData 를 spread.
   */
  audit?: boolean | {
    delete?: boolean;
    rowStatus?: boolean;
    insertPerson?: boolean;
    insertDate?: boolean;
    updatePerson?: boolean;
    updateTime?: boolean;
  };
  /** audit delete 컬럼이 행 삭제 시 호출할 setter (model.bind() 가 자동 주입). */
  setRowData?: (updater: any) => void;
};

export default function DataGrid<TRow>({
  tabs,
  presets,
  rowData = [],
  columnDefs = [],
  layoutType = "tab",
  actions,
  subTitle,
  pagination = true,
  pageSize = 500,
  onRowSelected,
  renderRightGrid,
  disableAutoSize,
  onRowClicked,
  onRowDoubleClicked,
  rowSelection: rowSelectionProp,
  headerCheckbox,
  autoSizeKey,
  onCellValueChanged,
  onSelectionChanged,
  selectedRow,
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
  autoSelectFirstRow,
  rowKeys,
  audit,
  setRowData,
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
  const prevSelectedRef = useRef<TRow | null>(null);
  const prevRowCountRef = useRef(0);
  const selectedCellsRef = useRef<Set<string>>(new Set());
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ rowIndex: number; colIndex: number } | null>(
    null,
  );
  const columnOrderRef = useRef<string[]>([]);

  const totalPages = Math.ceil((totalCount ?? 0) / (pageSize ?? 20));

  const activeColumnDefs = useMemo(() => {
    const base =
      layoutType === "tab" && activeTab && presets
        ? presets[activeTab].columnDefs ?? []
        : columnDefs;

    // audit === undefined / false → 자동 추가 안 함 (기존 화면 호환)
    if (!audit) return base;

    const auditOpts = typeof audit === "object" ? audit : undefined;
    return [...base, ...(standardAudit(setRowData, auditOpts) as any[])];
    // setRowData 는 model.bind() Proxy 가 매번 새 함수 reference 를 반환 →
    // deps 에 두면 finalColumnDefs 가 매 render 마다 재생성되어 ag-grid 가
    // columnEverythingChanged 를 폭주시키고 cellEditor mount 를 차단함.
    // 함수 자체의 호출 결과는 동일하므로 deps 에서 제외 (stale closure 무해).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutType, activeTab, presets, columnDefs, audit]);

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
        if (Array.isArray(c?.children))
          out.push(...collectSummable(c.children));
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

  /** 컬럼 변환은 gridCommon.processColumnDef 가 처리. (Lang/align/type/DTTM/date/numeric/_STS) */
  const finalColumnDefs = useMemo(
    () =>
      activeColumnDefs.map((col) =>
        processColumnDef(col, {
          codeMap: activeCodeMap,
          rowCountForNo: activeRowData.length,
          setRowData,
        }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeColumnDefs, activeCodeMap, setRowData],
  );

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
    // activeRowData 대신 autoSizeKey 를 dep 으로 사용 — 객체 set(조회) 에만 +1 되므로
    // 셀 편집/행 추가 같은 함수형 setter 호출에는 autoSize 가 재발화하지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, autoSizeKey, finalColumnDefs, runAutoSize, disableAutoSize]);

  // ─── controller 가 박은 selectedRow 를 ag-grid 시각 선택으로 자동 반영 ─
  // model.bind() 가 selectedRow 를 spread → controller 의 setSelected(row) 결과가
  // ag-grid 의 row hi-light 까지 도달. ag-grid api 호출이 발화하는 onSelectionChanged
  // 는 source="api" 라 handleSelectionChanged 가 무시 — 무한 루프 없음.
  useEffect(() => {
    const api = gridApiRef.current;
    if (!api || api.isDestroyed?.()) return;
    if (selectedRow == null) {
      if (api.getSelectedRows().length > 0) api.deselectAll();
      return;
    }
    const id = selectedRow.__rid__;
    if (!id) return;
    const node = api.getRowNode(id);
    if (!node) return;
    if (!node.isSelected()) node.setSelected(true, true);
  }, [selectedRow, activeRowData]);

  // ─── 자동 첫행 선택 (이전 선택을 rowKeys 로 보존, 없으면 첫 표시 행) ─────
  useEffect(() => {
    if (!autoSelectFirstRow) return;
    const api = gridApiRef.current;
    if (!api || api.isDestroyed?.()) return;
    if (!activeRowData?.length) return;

    requestAnimationFrame(() => {
      if (api.isDestroyed?.()) return;

      const keys = Array.isArray(rowKeys)
        ? rowKeys
        : rowKeys
          ? [rowKeys]
          : [];
      const prev = prevSelectedRef.current as any;

      let target: any = null;
      if (prev && keys.length) {
        api.forEachNode((n: any) => {
          if (target || !n.data) return;
          if (keys.every((k) => n.data[k] === prev[k])) target = n;
        });
      }
      if (!target) target = api.getDisplayedRowAtIndex(0);

      if (target && !target.isSelected()) {
        target.setSelected(true);
        activeOnRowClicked?.(target.data);
      }
    });
  }, [activeRowData, autoSelectFirstRow, rowKeys, activeOnRowClicked]);

  // ─── 행 추가 시 자동 스크롤 + 포커스 (EDIT_STS:"I" 인 새 마지막 행) ─────
  useEffect(() => {
    const api = gridApiRef.current;
    if (!api || api.isDestroyed?.()) return;

    const currCount = activeRowData?.length ?? 0;
    const prevCount = prevRowCountRef.current;
    prevRowCountRef.current = currCount;

    if (currCount <= prevCount || currCount === 0) return;
    const lastRow = activeRowData[currCount - 1] as any;
    if (lastRow?.EDIT_STS !== "I") return;

    requestAnimationFrame(() => {
      if (api.isDestroyed?.()) return;
      const lastIndex = currCount - 1;
      api.ensureIndexVisible(lastIndex, "bottom");
    });
  }, [activeRowData]);

  // ─── 신규 행 (EDIT_STS:"I") 에 컬럼 default 자동 적용 ───────────────
  // type:"check" 컬럼의 defaultYn (없으면 "N") 을 신규 행의 해당 field 가
  // 비어있을 때 자동으로 채움. 사용자가 토글 안 해도 저장 시 default 포함.
  // 이미 default 가 박힌 행은 setRowData 가 same prev 반환 → re-render 없음 (무한루프 가드).
  useEffect(() => {
    if (!setRowData) return;
    const defaults: Record<string, string> = {};
    for (const col of activeColumnDefs as any[]) {
      if (col?.type === "check" && col?.field) {
        defaults[col.field] = col.defaultYn ?? "N";
      }
    }
    if (Object.keys(defaults).length === 0) return;

    setRowData((prev: any) => {
      if (!prev?.rows) return prev;
      let changed = false;
      const newRows = prev.rows.map((r: any) => {
        if (r.EDIT_STS !== "I") return r;
        const updates: Record<string, any> = {};
        for (const [f, v] of Object.entries(defaults)) {
          if (r[f] === undefined || r[f] === null || r[f] === "") {
            updates[f] = v;
          }
        }
        if (Object.keys(updates).length === 0) return r;
        changed = true;
        return { ...r, ...updates };
      });
      return changed ? { ...prev, rows: newRows } : prev;
    });
  }, [activeRowData, activeColumnDefs, setRowData]);

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
      const colIndex = columnOrderRef.current.indexOf(colId);
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
      const borderColor = `rgba(${rgb},0.5)`;

      container.querySelectorAll<HTMLElement>(".ag-cell").forEach((cell) => {
        const coords = getCellCoords(cell);
        if (!coords) return;
        const { rowIndex: r, colIndex: c } = coords;
        const selected = keys.has(`${r}:${c}`);

        if (!selected) {
          cell.classList.remove("cell-range-bg");
          cell.style.boxShadow = "";
          return;
        }

        // 배경은 CSS 클래스로 적용 (theme.css 의 ag-row-selected !important 를 이기는 specificity)
        cell.classList.add("cell-range-bg");

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
      // ── DEBUG ─ 복사 안 될 때 어디서 막히는지 확인용 임시 로그
      console.log("[Copy]", {
        activeTag: tag,
        cellCount: selectedCellsRef.current.size,
        active: document.activeElement,
      });
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (selectedCellsRef.current.size === 0) return;
      e.preventDefault();
      e.stopPropagation();
      const tsv = tsvFromSelection();
      if (!tsv) return;
      navigator.clipboard.writeText(tsv).then(
        () => console.log("[Copy] success", tsv.length, "chars"),
        (err) => console.warn("[Copy] writeText failed", err),
      );
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

    // ag-grid 가 행 선택/refresh 시 셀 DOM 을 재렌더하면서
    // cell-range-bg 클래스/inline box-shadow 를 지워버리는 문제 보완 —
    // 선택 셀이 있는 동안만 DOM 변경을 감지해 highlight 재적용
    let rafId: number | null = null;
    const reapply = () => {
      if (selectedCellsRef.current.size === 0) return;
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        applyHighlight();
      });
    };
    const observer = new MutationObserver(reapply);
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mousedown", onDocumentMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("keydown", onKeyDown, true);
      observer.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────

  const wrappedActions = useMemo(
    () => wrapActions(activeActions, selectedRows),
    [activeActions, selectedRows],
  );

  const wrappedActionsWithTrack = useMemo(() => {
    if (!onTrack) return wrappedActions;
    const trackAction: ActionItem = {
      type: "button",
      key: "__track__",
      label: "LBL_AR_TRACE",
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

  // ag-grid 에 흘러가는 prop 의 reference 를 안정화 — 부모 re-render 시에도
  // ag-grid 가 내부 상태(cellEditor 등) 를 reset 하지 않도록 한다.
  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      minWidth: MIN_COL_WIDTH,
      filter: true,
      floatingFilter: true,
    }),
    [],
  );

  const rowSelection = useMemo(
    () => {
      const hide = headerCheckbox === false;
      return rowSelectionProp === "single"
        ? {
            mode: "singleRow" as const,
            enableClickSelection: true,
            ...(hide && { checkboxes: false, headerCheckbox: false }),
          }
        : {
            mode: "multiRow" as const,
            enableClickSelection: false,
            ...(hide && { checkboxes: false, headerCheckbox: false }),
          };
    },
    [rowSelectionProp, headerCheckbox],
  );

  const selectionColumnDef = useMemo(
    () => ({
      headerClass: "ag-selection-header-center",
      width: 30,
      minWidth: 30,
      maxWidth: 30,
    }),
    [],
  );

  const handleRowSelected = useCallback(
    (e: any) => {
      if (!e.api) return;
      const rows = e.api.getSelectedRows();
      // 같은 selection 이면 state 변경 skip — re-render 시 cellEditor 영향 회피
      setSelectedRows((prev) => {
        if (
          prev.length === rows.length &&
          prev.every((r: any, i: number) => r === rows[i])
        ) {
          return prev;
        }
        return rows;
      });
      if (e.node.isSelected() && e.data) {
        prevSelectedRef.current = e.data;
        onRowSelected?.(e.data);
      } else {
        setTimeout(() => {
          if (e.api.getSelectedRows().length === 0) {
            onRowSelected?.(null);
          }
        }, 0);
      }
    },
    [onRowSelected],
  );

  const handleRowClicked = useCallback(
    (e: any) => {
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
      prevSelectedRef.current = e.data;
      activeOnRowClicked?.(e.data);
    },
    [activeOnRowClicked],
  );

  const handleRowDoubleClicked = useCallback(
    (e: any) => {
      if (!e.data) return;
      onRowDoubleClicked?.(e.data);
    },
    [onRowDoubleClicked],
  );

  const handleCellValueChanged = useMemo(
    () => withRowStatusTracking(activeOnCellValueChanged),
    [activeOnCellValueChanged],
  );

  // 사용자 액션에 의한 selection 변경만 외부로 전파.
  // rowDataChanged/api/gridInitializing/selectableChanged 등 자동 이벤트는 무시 —
  // 검색 결과 도착 시 handleSearch 가 명시적으로 박은 selectedRef 를 덮어쓰지 않도록.
  const USER_SELECTION_SOURCES = useMemo(
    () =>
      new Set([
        "rowClicked",
        "checkboxSelected",
        "spaceKey",
        "keyboardSelection",
        "uiSelectAll",
        "uiSelectAllCurrentPage",
        "uiSelectAllFiltered",
      ]),
    [],
  );
  const handleSelectionChanged = useCallback(
    (e: any) => {
      if (!onSelectionChanged) return;
      if (!USER_SELECTION_SOURCES.has(e.source)) return;
      const rows = e.api.getSelectedRows();
      onSelectionChanged(rows.length === 0 ? null : rows[0]);
    },
    [onSelectionChanged, USER_SELECTION_SOURCES],
  );

  const treeProps = useMemo(
    () =>
      treeData
        ? {
            treeData: true as const,
            getDataPath,
            autoGroupColumnDef,
            groupDefaultExpanded,
          }
        : null,
    [treeData, getDataPath, autoGroupColumnDef, groupDefaultExpanded],
  );

  const commonGridProps = useMemo(
    () => ({
      columnDefs: finalColumnDefs,
      pinnedBottomRowData: summaryRow,
      defaultColDef,
      headerHeight: 28,
      rowHeight: 22,
      onGridReady: handleGridReady,
      onFirstDataRendered: handleFirstDataRendered,
      // tree 모드는 getDataPath 가 row id 를 결정 — 충돌 방지로 getRowId 안 줌.
      ...(treeData ? {} : { getRowId: (p: any) => p.data?.__rid__ }),
      ...(treeProps ?? {}),
      onRowSelected: handleRowSelected,
      onSelectionChanged: handleSelectionChanged,
      onRowClicked: handleRowClicked,
      onRowDoubleClicked: handleRowDoubleClicked,
      onCellValueChanged: handleCellValueChanged,
      rowSelection,
      selectionColumnDef,
      // ─── Escape Hatch: 외부 gridOptions 오버라이드 (최종 우선순위) ──────────
      ...gridOptions,
    }),
    [
      finalColumnDefs,
      summaryRow,
      defaultColDef,
      handleGridReady,
      handleFirstDataRendered,
      treeProps,
      handleRowSelected,
      handleSelectionChanged,
      handleRowClicked,
      handleRowDoubleClicked,
      handleCellValueChanged,
      rowSelection,
      selectionColumnDef,
      gridOptions,
      treeData,
    ],
  );

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
            subTitle={subTitle && Lang.get(subTitle)}
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
                    subTitle={subTitle && Lang.get(subTitle)}
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

      {pagination && totalCount != null && (
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
