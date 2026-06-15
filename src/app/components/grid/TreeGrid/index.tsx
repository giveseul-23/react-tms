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
  type Dispatch,
  type SetStateAction,
} from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GetRowIdParams } from "ag-grid-community";

import { GridActionsBar, ActionItem } from "@/app/components/ui/GridActionsBar";
import {
  processColumnDef,
  wrapActions,
  withRowStatusTracking,
  GRID_WRAPPER_CLASS,
  GRID_BODY_CLASS,
  GRID_INNER_CLASS,
  GRID_CSS_VARS,
  GRID_HEADER_HEIGHT,
  GRID_ROW_HEIGHT,
  DEFAULT_COL_DEF_BASE,
  useAutoSize,
  measureTextWidth,
} from "../gridCommon";
import { standardAudit } from "../columns/commonColumns";
import { Lang } from "@/app/services/common/Lang";

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
  /** 특정 노드를 펼침 — 행 추가 직후 부모 펼치기에 사용. */
  expand: (id: string) => void;
  expandedIds: Set<string>;
  /** 현재 화면에 표시 중인(런타임 숨김 제외) 컬럼 colId 목록 — 표시 순서. 엑셀 등에서 사용. */
  getVisibleColIds: () => string[];
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
  /** 이름 컬럼 너비 (기본: 180). getNameText 지정 시 이 값은 autosize 의 최소폭으로 쓰인다. */
  nameColumnWidth?: number;
  /** 지정 시 이름 컬럼을 source 기준으로 autosize — 들여쓰기(level)·화살표·아이콘·라벨 폭 반영.
   *  반환값은 측정용 라벨 텍스트. 미지정이면 nameColumnWidth 고정폭 유지(하위호환). */
  getNameText?: (row: TRow) => string;
  getRowId?: (params: GetRowIdParams<TRow>) => string;
  headerHeight?: number;
  rowHeight?: number;
  /** 정렬 기준 필드 (기본: "level" 순서 — source 배열 순서 유지) */
  sortField?: keyof TRow;
  /** 기본 펼침 레벨 (-1: 전체, 0: 루트만, N: N레벨까지 / 기본: 0) */
  defaultExpandLevel?: number;
  /** 액션바 좌측에 표시할 부제목 (DataGrid 의 subTitle 과 동일). LBL_ 키면 Lang.get 자동 적용. */
  subTitle?: string;
  /** true 면 subTitle 에 Lang.get 을 적용하지 않고 원문 그대로 표시 (동적 내용용). */
  subTitleNoLang?: boolean;
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
  /** 셀 값 변경 콜백. 공통단에서 EDIT_STS = "U" 자동 마킹 후 호출됨. */
  onCellValueChanged?: (params: any) => void;
  /** flat source 배열의 setter. 넘기면 type:"check"/"combo"/"popup"/"date" 등
   *  cellRenderer 안의 onChange 가 source 를 직접 갱신할 수 있도록 어댑터를 만들어
   *  processColumnDef 에 setRowData 로 주입한다. 미지정 시 기존 동작 유지(읽기 전용). */
  setSource?: Dispatch<SetStateAction<TRow[]>>;
  /** codeKey 컬럼의 코드→명 변환 맵 (DataGrid 와 동일). { [codeKey]: { 코드: 명 } } */
  codeMap?: Record<string, Record<string, string>>;
  /**
   * columnDefs 끝에 standardAudit 자동 spread. (DataGrid 와 동일 형태)
   *   true       — 모두 ON (delete/rowStatus/insertPerson/insertDate/updatePerson/updateTime)
   *   false      — 자동 추가 안 함
   *   undefined  — 자동 추가 안 함 (기존 화면 호환)
   *   객체       — 부분 토글 (예: { updatePerson: false })
   */
  audit?:
    | boolean
    | {
        delete?: boolean;
        rowStatus?: boolean;
        insertPerson?: boolean;
        insertDate?: boolean;
        updatePerson?: boolean;
        updateTime?: boolean;
      };
  /** autoSize 끄기 (DataGrid 와 동일 옵션). */
  disableAutoSize?: boolean;
  /** autoSize 재실행 트리거 — 조회 시점에 +1 (DataGrid 와 동일). */
  autoSizeKey?: number;
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
  // 사이클(parentId === id) / 중복 id 방어 — 무한 재귀로 스택 오버플로우 방지
  const visited = new Set<string>();
  function visit(parentId: string | null) {
    const children = source.filter((r) => r.parentId === parentId);
    const sorted = sortField
      ? [...children].sort(
          (a, b) => Number(a[sortField]) - Number(b[sortField]),
        )
      : children;
    sorted.forEach((row) => {
      if (visited.has(row.id)) return;
      visited.add(row.id);
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
    getNameText,
    subTitle,
    subTitleNoLang,
    getRowId,
    headerHeight = GRID_HEADER_HEIGHT,
    rowHeight = GRID_ROW_HEIGHT,
    sortField,
    defaultExpandLevel = 0,
    actions,
    onRowClicked,
    onRowSelected,
    onCellValueChanged,
    setSource,
    codeMap,
    audit,
    disableAutoSize,
    autoSizeKey,
  }: TreeGridProps<TRow>,
  ref: React.Ref<TreeGridHandle>,
) {
  // ── 트리 상태 ──────────────────────────────────────────────────────────────
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() =>
    buildInitialExpanded(source, defaultExpandLevel),
  );

  // source 변경 시 expandedIds 정리.
  //   - 빈 → 데이터 로드 (초기 조회): defaults 적용
  //   - 점진 변경(행 추가/삭제): 기존 expansion 유지 (유효 id 만 필터) → defaults 안 섞음
  //   - 재조회로 이전 expansion 이 전부 사라진 경우: defaults 복원
  const prevSourceLengthRef = useRef<number>(source.length);
  useEffect(() => {
    if (source.length === 0 && prevSourceLengthRef.current === 0) return;
    const wasEmpty = prevSourceLengthRef.current === 0;
    prevSourceLengthRef.current = source.length;

    if (wasEmpty) {
      setExpandedIds(buildInitialExpanded(source, defaultExpandLevel));
      return;
    }

    const validIds = new Set(source.map((r) => r.id));
    setExpandedIds((prev) => {
      const filtered = new Set<string>();
      prev.forEach((id) => {
        if (validIds.has(id)) filtered.add(id);
      });
      // 이전엔 펼쳐진 게 있었는데 모두 사라졌다면 재조회로 판단 → defaults 복원
      if (prev.size > 0 && filtered.size === 0) {
        return buildInitialExpanded(source, defaultExpandLevel);
      }
      return filtered;
    });
    // defaultExpandLevel 은 보통 고정값이므로 source 만 dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

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

  const expand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const visibleRows = useMemo(
    () => calcVisibleRows(source, expandedIds, sortField),
    [source, expandedIds, sortField],
  );

  // ── 부모에게 명령형 API 노출 ───────────────────────────────────────────────
  const getVisibleColIds = useCallback(() => {
    const api = gridApiRef.current;
    if (!api || api.isDestroyed?.()) return [];
    return (api.getAllDisplayedColumns() ?? []).map((c: any) => c.getColId());
  }, []);

  useImperativeHandle(
    ref,
    () => ({ expandAll, collapseAll, expand, expandedIds, getVisibleColIds }),
    [expandAll, collapseAll, expand, expandedIds, getVisibleColIds],
  );

  // ── 액션 래핑 (gridCommon.wrapActions 사용) ──────────────────────────────
  const wrappedActions = useMemo<ActionItem[]>(
    () => wrapActions(actions, selectedRows),
    [actions, selectedRows],
  );

  // 이름 컬럼 autosize — source 전체 기준(펼침상태 무관)으로 트리 셀 실제 폭 계산.
  // 셀 구조(TreeNameCell): paddingLeft(level*18) + 연결선(level>0:16) + 화살표/여백(16)
  //   + 아이콘(20) + 라벨텍스트(폴더행 bold 보정) + 우측여백(16). getNameText 미지정 시 고정폭.
  const nameColWidth = useMemo<number>(() => {
    if (!getNameText) return nameColumnWidth;
    const INDENT = 18;
    const CHROME = 16 /* 화살표/여백 */ + 20 /* 아이콘 */ + 16 /* 우측여백 */;
    let max = nameColumnWidth;
    for (const row of source) {
      const hasChild = hasChildSet.has(row.id);
      const text = getNameText(row) ?? "";
      const w =
        row.level * INDENT +
        (row.level > 0 ? 16 : 0) +
        CHROME +
        measureTextWidth(text) * (hasChild ? 1.06 : 1);
      if (w > max) max = w;
    }
    return Math.min(Math.round(max), 480);
  }, [getNameText, nameColumnWidth, source, hasChildSet]);

  // ── 이름 컬럼 (트리 셀) ────────────────────────────────────────────────────
  const nameColDef = useMemo<ColDef<TRow>>(
    () => ({
      headerName: nameColumnHeader,
      field: "id" as any,
      width: nameColWidth,
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
    [expandedIds, isLastMap, toggle, nameColumnHeader, nameColumnWidth, nameColWidth],
  );

  // commitRowChange/Changes 는 { rows } 모양을 가정 → flat source[] ↔ { rows } 어댑터.
  // setSource 미지정 시 어댑터 undefined → 기존 동작 유지(읽기 전용 셀).
  const setRowDataAdapter = useMemo(
    () =>
      setSource
        ? (updater: any) => {
            setSource((prev) => {
              const next =
                typeof updater === "function"
                  ? updater({ rows: prev })
                  : updater;
              return next?.rows ?? prev;
            });
          }
        : undefined,
    [setSource],
  );

  // 컬럼 변환은 gridCommon.processColumnDef 가 처리. (Lang/align/type/DTTM/date/numeric/_STS)
  // audit truthy → columnDefs 끝에 standardAudit 자동 추가 후 동일하게 processColumnDef 적용 (DataGrid 와 동일).
  //
  // 두 단계로 분리:
  //   1) stableColumnDefs — nameColDef 제외. expandedIds 등 트리 내부 상태와 무관 → ref 안정.
  //      useAutoSize 에 이 리스트를 넘겨 펼침/접기 시 autoSize 재발화를 방지.
  //   2) finalColumnDefs — nameColDef + stableColumnDefs. AG-Grid 에 넘기는 실제 컬럼 정의.
  const stableColumnDefs = useMemo<ColDef<TRow>[]>(() => {
    const auditCols = audit
      ? (standardAudit(
          setRowDataAdapter,
          typeof audit === "object" ? audit : undefined,
        ) as ColDef<TRow>[])
      : [];
    return [...columnDefs, ...auditCols].map(
      (col) =>
        processColumnDef(col, {
          setRowData: setRowDataAdapter,
          codeMap,
        }) as ColDef<TRow>,
    );
  }, [columnDefs, setRowDataAdapter, audit, codeMap]);

  // nameColDef 는 트리 셀 전용 — processColumnDef 통과 안 함.
  const finalColumnDefs = useMemo<ColDef<TRow>[]>(
    () => [nameColDef, ...stableColumnDefs],
    [nameColDef, stableColumnDefs],
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

  // 외부에서 autoSizeKey 를 안 넘기면 내부적으로 키를 bump 해 autoSize 를 재발화시킨다.
  // 단 "조회(새 데이터 로드)" 에만 bump — 추가/편집/삭제 같은 in-place mutation 은 제외 →
  // 셀 편집(체크박스 토글 등) 시 스크롤이 최상단으로 튀지 않음. (DataGrid autoSizeKey 정책과 동일)
  //
  // 판별: mutation 은 이전 source 의 행 객체를 재사용(spread/filter/map-keep)하므로 일부 ref 가
  //       prev 에 존재한다. 조회/재조회는 buildSource 로 전부 새 객체를 만들어 prev 와 겹치는
  //       ref 가 하나도 없다 → 그 경우에만 fresh load 로 보고 bump.
  const internalAutoSizeVersionRef = useRef(0);
  const prevSourceRef = useRef<TRow[]>([]);
  const internalAutoSizeKey = useMemo(() => {
    const prevSet = new Set(prevSourceRef.current);
    prevSourceRef.current = source;
    const isFreshLoad =
      source.length > 0 && source.every((r) => !prevSet.has(r));
    if (isFreshLoad) internalAutoSizeVersionRef.current += 1;
    return internalAutoSizeVersionRef.current;
  }, [source]);

  // autoSize — DataGrid 와 동일한 hook 사용 (handleGridReady 안에서
  // gridApiRef / columnOrderRef 초기화도 함께 처리).
  // 트리에서는 펼침 상태와 무관하게 source 전체 기준으로 폭 계산 — 펼쳤을 때
  // audit / 긴 셀값이 잘리지 않도록.
  // 펼침/접기 시에는 autoSize 재발화 안 하도록 nameColDef 제외한 stableColumnDefs 전달.
  const { handleGridReady, handleFirstDataRendered } = useAutoSize<TRow>({
    disableAutoSize,
    finalColumnDefs: stableColumnDefs,
    activeRowData: source,
    autoSizeKey: autoSizeKey ?? internalAutoSizeKey,
    gridApiRef,
    columnOrderRef,
  });

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
        .trim();
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
          cell.style.outline = "";
          return;
        }

        // 배경은 CSS 클래스로 적용 (theme.css 의 ag-row-selected !important 를 이기는 specificity)
        cell.classList.add("cell-range-bg");
        cell.style.outline = "";

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
      document.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("keydown", onKeyDown, true);
      observer.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className={GRID_WRAPPER_CLASS}>
      {/* ── 액션바 (DataGrid 와 동일한 GridActionsBar 사용) ── */}
      <div className="relative z-1 shrink-0 min-w-0 w-full">
        <GridActionsBar
          actions={wrappedActions}
          subTitle={
            subTitle ? (subTitleNoLang ? subTitle : Lang.get(subTitle)) : undefined
          }
        />
      </div>

      {/* ── 그리드 본문 ── */}
      <div ref={gridContainerRef} className={GRID_BODY_CLASS}>
        <div className={GRID_INNER_CLASS} style={GRID_CSS_VARS}>
          <AgGridReact<TRow>
            rowData={visibleRows}
            columnDefs={finalColumnDefs}
            // tree 는 정렬을 sortField 기반으로 자체 처리 → ag-grid sort 끔.
            defaultColDef={{ ...DEFAULT_COL_DEF_BASE, sortable: false }}
            headerHeight={headerHeight}
            rowHeight={rowHeight}
            getRowId={getRowId}
            onGridReady={handleGridReady}
            onFirstDataRendered={handleFirstDataRendered}
            suppressMovableColumns
            // ── 행 선택 처리 — tree 는 체크박스 미사용, 단일 행 클릭 선택 ──
            rowSelection={{
              mode: "singleRow",
              enableClickSelection: true,
              checkboxes: false,
            }}
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
              // 셀 내부 input (USE_YN 체크 셀 등) 클릭은 행 선택 트리거하지 않음
              if (target?.tagName === "INPUT") return;
              if (e.event?.shiftKey) return;
              if (!e.data) return;
              onRowClicked?.(e.data);
            }}
            onCellValueChanged={withRowStatusTracking(onCellValueChanged)}
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
