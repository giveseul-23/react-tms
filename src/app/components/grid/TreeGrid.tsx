"use client";
// app/components/grid/TreeGrid.tsx
//
// ─── 역할 ────────────────────────────────────────────────────────────────────
//  이 컴포넌트 하나가 트리 그리드에 필요한 모든 공통 기능을 담당합니다.
//
//  [페이지에서 할 일]         [TreeGrid가 알아서 하는 일]
//  ─────────────────────     ────────────────────────────────────────
//  SOURCE 배열 정의           expandedIds 상태 관리
//  id / parentId / level     toggle (펼치기/접기 + 자손 일괄 접기)
//  컬럼 정의 (columnDefs)     IS_LAST 계산 (연결선 끊김 처리)
//  NameCell 렌더러 구성       visibleRows 계산 (보여줄 행 필터링)
//  expandAll / collapseAll   가로 스크롤
//  툴바/UI 레이아웃           드래그 범위 선택 + Ctrl+C TSV 복사
//                             GridActionsBar (DataGrid 와 동일한 액션바)
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GetRowIdParams, GridReadyEvent } from "ag-grid-community";

import { GridActionsBar, ActionItem } from "@/app/components/ui/GridActionsBar";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

// ─── 공개 타입 ────────────────────────────────────────────────────────────────

/** TreeGrid에 넘기는 SOURCE 행이 반드시 가져야 할 최소 필드 */
export type TreeRow = {
  id: string;
  parentId: string | null;
  level: number;
  [key: string]: any;
};

/** 페이지에서 ref로 접근할 수 있는 명령형 API */
export type TreeGridHandle = {
  expandAll: () => void;
  collapseAll: () => void;
  expandedIds: Set<string>;
};

/** NameCell 렌더러에 주입되는 트리 컨텍스트 */
export type TreeCellContext = {
  /** 현재 행이 펼쳐져 있는지 */
  isExpanded: boolean;
  /** 부모 그룹에서 마지막 자식인지 (연결선 끊김 처리용) */
  isLastChild: boolean;
  /** 펼치기/접기 토글 */
  toggle: (id: string) => void;
};

type TreeGridProps<TRow extends TreeRow> = {
  /** 전체 SOURCE 배열 (id/parentId/level 포함) */
  source: TRow[];
  /**
   * 트리 이름 컬럼의 cellRenderer.
   * AG Grid params + TreeCellContext 를 받아 ReactNode 를 반환합니다.
   *
   * @example
   * renderNameCell={(params, ctx) => (
   *   <NameCell params={params} ctx={ctx} />
   * )}
   */
  renderNameCell: (params: any, ctx: TreeCellContext) => React.ReactNode;
  /** 이름 컬럼 이외의 나머지 컬럼 정의 */
  columnDefs: ColDef<TRow>[];
  /** 이름 컬럼 헤더명 (기본: "") */
  nameColumnHeader?: string;
  /** 이름 컬럼 너비 (기본: 180) */
  nameColumnWidth?: number;
  getRowId?: (params: GetRowIdParams<TRow>) => string;
  headerHeight?: number;
  rowHeight?: number;
  /** 정렬 기준 필드 (기본: "level" 순서 — source 배열 순서 유지) */
  sortField?: keyof TRow;
  /** 기본 펼침 레벨 (-1: 전체, 0: 루트만, N: N레벨까지 / 기본: 0) */
  defaultExpandLevel?: number;
  /**
   * GridActionsBar에 넘길 액션 목록.
   * DataGrid 와 동일한 ActionItem[] 타입을 사용합니다.
   * onClick({ data }) 에서 data 는 현재 선택된 행 배열입니다.
   */
  actions: ActionItem[];
  /** 행 클릭 콜백 */
  onRowClicked?: (row: TRow) => void;
  /** 행 선택 콜백 */
  onRowSelected?: (row: TRow | null) => void;
};

// ─── 트리 유틸 (컴포넌트 내부) ───────────────────────────────────────────────

function buildIsLastMap<TRow extends TreeRow>(
  source: TRow[],
  sortField?: keyof TRow,
): Record<string, boolean> {
  const map: Record<string, boolean> = {};
  const grouped: Record<string, TRow[]> = {};
  source.forEach((r) => {
    const k = r.parentId ?? "__root__";
    (grouped[k] = grouped[k] ?? []).push(r);
  });
  Object.values(grouped).forEach((siblings) => {
    const sorted = sortField
      ? [...siblings].sort(
          (a, b) => Number(a[sortField]) - Number(b[sortField]),
        )
      : siblings;
    sorted.forEach((row, i) => {
      map[row.id] = i === sorted.length - 1;
    });
  });
  return map;
}

function buildInitialExpanded<TRow extends TreeRow>(
  source: TRow[],
  defaultExpandLevel: number,
): Set<string> {
  const hasChildSet = new Set(
    source.map((r) => r.parentId).filter(Boolean) as string[],
  );
  if (defaultExpandLevel < 0) {
    return new Set(
      source.filter((r) => hasChildSet.has(r.id)).map((r) => r.id),
    );
  }
  return new Set(
    source
      .filter((r) => r.level < defaultExpandLevel && hasChildSet.has(r.id))
      .map((r) => r.id),
  );
}

function getDescendantIds<TRow extends TreeRow>(
  source: TRow[],
  id: string,
): string[] {
  const direct = source.filter((r) => r.parentId === id).map((r) => r.id);
  return direct.flatMap((cid) => [cid, ...getDescendantIds(source, cid)]);
}

function calcVisibleRows<TRow extends TreeRow>(
  source: TRow[],
  expandedIds: Set<string>,
  sortField?: keyof TRow,
): TRow[] {
  const result: TRow[] = [];
  function visit(parentId: string | null) {
    const children = source.filter((r) => r.parentId === parentId);
    const sorted = sortField
      ? [...children].sort(
          (a, b) => Number(a[sortField]) - Number(b[sortField]),
        )
      : children;
    sorted.forEach((row) => {
      result.push(row);
      if (expandedIds.has(row.id)) visit(row.id);
    });
  }
  visit(null);
  return result;
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

function TreeGridInner<TRow extends TreeRow>(
  {
    source,
    renderNameCell,
    columnDefs,
    nameColumnHeader = "",
    nameColumnWidth = 180,
    getRowId,
    headerHeight = 22,
    rowHeight = 22,
    sortField,
    defaultExpandLevel = 0,
    actions,
    onRowClicked,
    onRowSelected,
  }: TreeGridProps<TRow>,
  ref: React.Ref<TreeGridHandle>,
) {
  // ── 트리 상태 ──────────────────────────────────────────────────────────────
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() =>
    buildInitialExpanded(source, defaultExpandLevel),
  );

  // ── 선택 행 상태 (액션바 onClick({ data }) 에 주입) ───────────────────────
  const [selectedRows, setSelectedRows] = useState<TRow[]>([]);

  const hasChildSet = useMemo(
    () => new Set(source.map((r) => r.parentId).filter(Boolean) as string[]),
    [source],
  );

  const isLastMap = useMemo(
    () => buildIsLastMap(source, sortField),
    [source, sortField],
  );

  const toggle = useCallback(
    (id: string) => {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          getDescendantIds(source, id).forEach((cid) => next.delete(cid));
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    },
    [source],
  );

  const expandAll = useCallback(() => {
    setExpandedIds(
      new Set(source.filter((r) => hasChildSet.has(r.id)).map((r) => r.id)),
    );
  }, [source, hasChildSet]);

  const collapseAll = useCallback(() => setExpandedIds(new Set()), []);

  const visibleRows = useMemo(
    () => calcVisibleRows(source, expandedIds, sortField),
    [source, expandedIds, sortField],
  );

  // ── 부모에게 명령형 API 노출 ───────────────────────────────────────────────
  useImperativeHandle(ref, () => ({ expandAll, collapseAll, expandedIds }), [
    expandAll,
    collapseAll,
    expandedIds,
  ]);

  // ── 액션 래핑 (DataGrid 와 동일한 패턴) ──────────────────────────────────
  // onClick({ data: selectedRows }) 형태로 호출되도록 selectedRows 를 주입
  const wrappedActions = useMemo<ActionItem[]>(() => {
    return (actions ?? []).map((action) => {
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
  }, [actions, selectedRows]);

  // ── 이름 컬럼 (트리 셀) ────────────────────────────────────────────────────
  const nameColDef = useMemo<ColDef<TRow>>(
    () => ({
      headerName: nameColumnHeader,
      field: "id" as any,
      width: nameColumnWidth,
      minWidth: nameColumnWidth,
      sortable: false,
      filter: false,
      floatingFilter: false,
      cellRenderer: (params: any) => {
        const row: TRow = params.data;
        const ctx: TreeCellContext = {
          isExpanded: expandedIds.has(row.id),
          isLastChild: isLastMap[row.id] ?? false,
          toggle,
        };
        return renderNameCell(params, ctx);
      },
    }),
    // renderNameCell은 페이지에서 useMemo/useCallback 으로 안정화 권장
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [expandedIds, isLastMap, toggle, nameColumnHeader, nameColumnWidth],
  );

  const finalColumnDefs = useMemo<ColDef<TRow>[]>(
    () => [nameColDef, ...columnDefs],
    [nameColDef, columnDefs],
  );

  // ── 드래그 범위 선택 + Ctrl+C 복사 ────────────────────────────────────────
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const gridApiRef = useRef<any>(null);
  const columnOrderRef = useRef<string[]>([]);
  const selectedCellsRef = useRef<Set<string>>(new Set());
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ rowIndex: number; colIndex: number } | null>(
    null,
  );

  const handleGridReady = useCallback((e: GridReadyEvent<TRow>) => {
    gridApiRef.current = e.api;
    columnOrderRef.current =
      e.api
        .getColumns()
        ?.map((c: any) => c.getColId())
        .filter(Boolean) ?? [];
  }, []);

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
      )
        for (
          let cl = Math.min(a.colIndex, b.colIndex);
          cl <= Math.max(a.colIndex, b.colIndex);
          cl++
        )
          keys.add(`${r}:${cl}`);
      return keys;
    }

    function applyHighlight() {
      container.querySelectorAll<HTMLElement>(".ag-cell").forEach((cell) => {
        const coords = getCellCoords(cell);
        if (!coords) return;
        const sel = selectedCellsRef.current.has(
          `${coords.rowIndex}:${coords.colIndex}`,
        );
        // cell.style.backgroundColor = sel ? "rgba(59,130,246,0.15)" : "";
        cell.style.outline = sel ? "1px solid rgba(59,130,246,0.5)" : "";
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
        minR = Math.min(minR, r);
        maxR = Math.max(maxR, r);
        minC = Math.min(minC, cl);
        maxC = Math.max(maxC, cl);
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
          cells.push(
            node?.data?.[field] != null ? String(node.data[field]) : "",
          );
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
            ?.map((c: any) => c.getColId())
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

  // ── 스타일 ────────────────────────────────────────────────────────────────
  const gridStyle = {
    ["--ag-font-size" as any]: "11px",
    ["--ag-header-font-size" as any]: "11px",
    ["--ag-row-height" as any]: `${rowHeight}px`,
    ["--ag-header-height" as any]: `${headerHeight}px`,
    ["--ag-cell-horizontal-padding" as any]: "4px",
    ["--ag-cell-vertical-padding" as any]: "1px",
    ["--ag-grid-size" as any]: "3px",
    ["--ag-background-color" as any]: "transparent",
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-[rgb(var(--bg))] flex flex-col h-full min-h-0">
      {/* ── 액션바 (DataGrid 와 동일한 GridActionsBar 사용) ── */}
      <div className="relative z-1 shrink-0 min-w-0 w-full">
        <GridActionsBar actions={wrappedActions} />
      </div>

      {/* ── 그리드 본문 ── */}
      <div ref={gridContainerRef} className="flex-1 min-h-0 overflow-auto">
        <div
          className="ag-theme-quartz ag-theme-bridge h-full"
          style={{ ...gridStyle, minWidth: "max-content" }}
        >
          <AgGridReact<TRow>
            theme="legacy"
            rowData={visibleRows}
            columnDefs={finalColumnDefs}
            defaultColDef={{
              resizable: true,
              sortable: false,
              filter: true,
              floatingFilter: true,
            }}
            headerHeight={headerHeight}
            rowHeight={rowHeight}
            getRowId={getRowId}
            onGridReady={handleGridReady}
            suppressMovableColumns
            suppressCellFocus
            suppressHorizontalScroll
            // ── 행 선택 처리 ──────────────────────────────────────────────
            rowSelection={{ mode: "multiRow", enableClickSelection: false }}
            onRowSelected={(e: any) => {
              if (!e.api) return;
              const rows = e.api.getSelectedRows() as TRow[];
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
            }}
            onRowClicked={(e: any) => {
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
            }}
          />
        </div>
      </div>
    </div>
  );
}

// forwardRef + 제네릭 조합을 위한 캐스팅
const TreeGrid = forwardRef(TreeGridInner) as <TRow extends TreeRow>(
  props: TreeGridProps<TRow> & { ref?: React.Ref<TreeGridHandle> },
) => React.ReactElement;

export default TreeGrid;
