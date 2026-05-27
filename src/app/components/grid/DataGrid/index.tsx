"use client";
// app/components/grid/DataGrid/index.tsx

import React, { useMemo, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ColGroupDef } from "ag-grid-community";

import { GridTabs } from "./GridTabs";
import type { GridPreset, GridTab } from "./types";
import { GridActionsBar, ActionItem } from "@/app/components/ui/GridActionsBar";

import { Lang } from "@/app/services/common/Lang";
import { wrapActions } from "../gridCommon";
import { useCellRangeSelection } from "./useCellRangeSelection";
import { useActivePreset } from "./useActivePreset";
import { useAutoSize } from "./useAutoSize";
import { useRowLifecycle } from "./useRowLifecycle";
import { useGridHandlers } from "./useGridHandlers";
import { useGridProps } from "./useGridProps";
import { Pagination } from "./Pagination";

// (Note: Util.formatDttm 등 컬럼 변환 관련 유틸은 gridUtils/processColumn 으로 이동.)

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

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

  // ─── Audit 컬럼 자동 추가 ────────────────────────────────────────────────
  /**
   * columnDefs 끝에 standardAudit 자동 spread.
   *   true       — 모두 ON (delete/rowStatus/insertPerson/insertDate/updatePerson/updateTime)
   *   false      — 자동 추가 안 함
   *   undefined  — 자동 추가 안 함 (기존 화면 호환)
   *   객체       — 부분 토글 (예: { updatePerson: false })
   * model.bind() 가 자동으로 audit:true + setRowData 를 spread.
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
  treeData,
  getDataPath,
  autoGroupColumnDef,
  groupDefaultExpanded = -1,
  codeMap,
  overrideRowData,
  gridOptions,
  onTabChange,
  audit,
  setRowData,
}: DataGridProps<TRow>) {
  const [selectedRows, setSelectedRows] = useState<TRow[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(
    tabs?.[0]?.key ?? null,
  );
  const internalGridRef = useRef<any>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const prevSelectedRef = useRef<TRow | null>(null);
  // selectedRow 의 최신값을 ref 로 추적 — 첫행 자동선택이 셀 편집으로 갱신된
  // selected 객체의 PK 를 보고 매칭하도록 (model 의 selected sync 와 짝).
  const selectedRowRef = useRef<TRow | null>(null);
  selectedRowRef.current = (selectedRow ?? null) as TRow | null;

  const gridApiRef = useRef<any>(null);
  const { columnOrderRef } = useCellRangeSelection({
    containerRef: gridContainerRef,
    gridApiRef,
  });

  const {
    activeColumnDefs,
    activeRowData,
    summaryRow,
    activeActions,
    activeOnCellValueChanged,
    activeOnRowClicked,
    effectiveRowKeys,
    effectiveAutoSelect,
    activeRender,
    finalColumnDefs,
  } = useActivePreset<TRow>({
    layoutType,
    activeTab,
    presets,
    columnDefs,
    rowData,
    overrideRowData,
    actions,
    onCellValueChanged,
    onRowClicked,
    codeMap,
    audit,
    setRowData,
  });

  const { handleGridReady, handleFirstDataRendered } = useAutoSize<TRow>({
    disableAutoSize,
    finalColumnDefs,
    activeRowData,
    activeTab,
    autoSizeKey,
    gridApiRef,
    columnOrderRef,
  });

  useRowLifecycle<TRow>({
    gridApiRef,
    selectedRow,
    activeRowData,
    activeColumnDefs: activeColumnDefs as any[],
    effectiveAutoSelect,
    effectiveRowKeys,
    activeOnRowClicked,
    setRowData,
    selectedRowRef,
    prevSelectedRef,
  });

  const wrappedActions = useMemo(
    () => wrapActions(activeActions, selectedRows),
    [activeActions, selectedRows],
  );

  const handlers = useGridHandlers<TRow>({
    setSelectedRows,
    prevSelectedRef,
    onRowSelected,
    activeOnRowClicked,
    onRowDoubleClicked,
    activeOnCellValueChanged,
    onSelectionChanged,
  });

  const { commonGridProps } = useGridProps<TRow>({
    finalColumnDefs,
    summaryRow,
    handleGridReady,
    handleFirstDataRendered,
    handleRowSelected: handlers.handleRowSelected,
    handleRowClicked: handlers.handleRowClicked,
    handleRowDoubleClicked: handlers.handleRowDoubleClicked,
    handleCellValueChanged: handlers.handleCellValueChanged,
    handleSelectionChanged: handlers.handleSelectionChanged,
    rowSelectionProp,
    headerCheckbox,
    treeData,
    getDataPath,
    autoGroupColumnDef,
    groupDefaultExpanded,
    gridOptions,
  });

  // ── __rid__ 보장 ──────────────────────────────────────────────
  // getRowId 가 항상 p.data.__rid__ 를 쓰므로(useGridProps), 모든 행에 __rid__ 가 있어야
  // ag-grid 의 행 식별/선택/부분 redraw 가 정상 동작한다.
  // useBaseModel 데이터는 이미 ensureRid 로 __rid__ 보유 → 같은 참조 그대로 반환(no-op).
  // rowData 를 직접 주입하는 그리드(팝업/피커 등)는 여기서 index 기반 id 를 부여.
  const rowDataWithRid = useMemo(
    () =>
      (activeRowData ?? []).map((r: any, i: number) =>
        r && r.__rid__ != null ? r : { ...r, __rid__: `__r${i}` },
      ),
    [activeRowData],
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

      <div className="relative z-1 shrink-0 min-w-0 w-full">
        <GridActionsBar
          actions={wrappedActions}
          subTitle={subTitle && Lang.get(subTitle)}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {activeRender ? (
          activeRender()
        ) : (
          <div
            className="ag-theme-quartz ag-theme-bridge w-full h-full"
            style={gridStyle}
          >
            <AgGridReact<TRow>
              ref={internalGridRef}
              {...commonGridProps}
              rowData={rowDataWithRid}
            />
          </div>
        )}
      </div>

      {pagination && totalCount != null && (
        <Pagination
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
