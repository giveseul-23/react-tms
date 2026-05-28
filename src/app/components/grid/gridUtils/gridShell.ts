// src/app/components/grid/gridUtils/gridShell.ts
//
// DataGrid 와 TreeGrid 가 공유하는 외관/스타일/AG-Grid 공통 옵션.
// "트리그리드는 보이는 것만 트리그리드" — wrapper, gridStyle, 헤더/행 높이,
// selectionColumnDef, defaultColDef 등은 모두 여기서 일원 관리.
//
// 변경 시 두 그리드 모두에 자동 반영된다.

/** 그리드 최외곽 wrapper className (border + flex-col + 높이) */
export const GRID_WRAPPER_CLASS =
  "border border-gray-200 rounded-md bg-[rgb(var(--bg))] flex flex-col h-full min-h-0";

/** 그리드 본문 영역 wrapper className (액션바 아래) */
export const GRID_BODY_CLASS = "flex-1 min-h-0 overflow-hidden";

/** ag-theme 적용되는 가장 안쪽 div className */
export const GRID_INNER_CLASS = "ag-theme-quartz ag-theme-bridge w-full h-full";

/** AG-Grid CSS 변수 (폰트/높이/패딩) — 두 그리드 동일 적용 */
export const GRID_CSS_VARS: React.CSSProperties = {
  ["--ag-font-size" as any]: "11px",
  ["--ag-header-font-size" as any]: "11px",
  ["--ag-row-height" as any]: "22px",
  ["--ag-header-height" as any]: "28px",
  ["--ag-cell-horizontal-padding" as any]: "3px",
  ["--ag-cell-vertical-padding" as any]: "1px",
  ["--ag-grid-size" as any]: "3px",
  ["--ag-checkbox-column-width" as any]: "16px",
};

/** AG-Grid headerHeight prop 기본값 */
export const GRID_HEADER_HEIGHT = 28;

/** AG-Grid rowHeight prop 기본값 */
export const GRID_ROW_HEIGHT = 22;

/** 선택 컬럼(체크박스) 정의 — DataGrid/TreeGrid 동일 */
export const SELECTION_COLUMN_DEF = {
  headerClass: "ag-selection-header-center",
  width: 30,
  minWidth: 30,
  maxWidth: 30,
} as const;

/** defaultColDef 공통 부분 — sortable 은 그리드별로 override (TreeGrid 는 false) */
export const DEFAULT_COL_DEF_BASE = {
  resizable: true,
  filter: true,
  floatingFilter: true,
} as const;
