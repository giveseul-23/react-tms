"use client";
// app/components/grid/DataGrid/index.tsx

import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ColGroupDef } from "ag-grid-community";

import { GridTabs } from "./GridTabs";
import type { GridPreset, GridTab } from "./types";
import { GridActionsBar, ActionItem } from "@/app/components/ui/GridActionsBar";
import { useResourceAccess, isGridDenied } from "@/app/feature/menuAuth";

import { Lang } from "@/app/services/common/Lang";
import {
  wrapActions,
  useAutoSize,
  GRID_WRAPPER_CLASS,
  GRID_BODY_CLASS,
  GRID_INNER_CLASS,
  GRID_CSS_VARS,
} from "../gridCommon";
import { useCellRangeSelection } from "./useCellRangeSelection";
import { useActivePreset } from "./useActivePreset";
import { useRowLifecycle } from "./useRowLifecycle";
import { useGridHandlers } from "./useGridHandlers";
import { useGridProps } from "./useGridProps";
import { Pagination } from "./Pagination";
import { usePopup } from "@/app/components/popup/PopupContext";

// (Note: Util.formatDttm 등 컬럼 변환 관련 유틸은 gridUtils/processColumn 으로 이동.)

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

// ─── 컴포넌트 ───────────────────────────────────────────────────────────────────

type DataGridProps<TRow> = {
  tabs?: GridTab[];
  presets?: Record<string, GridPreset<TRow>>;

  rowData?: TRow[] | Record<string, TRow[]>;
  columnDefs?: (ColDef<TRow> | ColGroupDef<TRow>)[];

  /** 서버 리소스 권한 식별자 (센차 grid.authId). 리소스 권한 적용(2단계)에서 사용. */
  authId?: string;

  layoutType?: "tab" | "plain";
  /** 그리드별 액션 버튼들. 비거나 생략하면 actions 바 자체 숨김. */
  actions?: ActionItem[];
  subTitle?: string;
  /** true 면 subTitle 에 Lang.get 을 적용하지 않고 원문 그대로 표시 (동적 내용용). */
  subTitleNoLang?: boolean;

  pagination?: boolean;

  onRowSelected?: (row: TRow | null) => void;
  onRowClicked?: (row: TRow) => void;
  onRowDoubleClicked?: (row: TRow) => void;
  /** 탭 전환 시 콜백 — 외부에서 activeTab 을 추적할 때 사용 */
  onTabChange?: (key: string) => void;
  /** 외부에서 활성 탭을 제어 — 지정 시 이 값으로 탭이 전환된다(미지정 시 내부 state 로 동작). */
  activeTab?: string;

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
  /** 사용자 선택 변경 시 선택된 행 "전체 배열" 전달 (다중 선택 추적용). */
  onSelectionRowsChanged?: (rows: any[]) => void;
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
  /** 인라인 편집 전면 차단 (picker/돋보기/combo/체크박스/native editable 모두 OFF).
   *  GridFormPage 가 자동 주입 — 폼이 편집 surface 인 화면의 그리드는 표시 전용. */
  readOnly?: boolean;
  /** columnDefs 변경 시 호출 — model.bind() 가 자동 주입.
   *  saveGrid 의 required 검증이 slot.columnDefsRef 로 컬럼 메타 read. */
  onColumnDefsReady?: (cols: any[]) => void;
  /** 엑셀 컬럼 getter 등록 — model.bind() 가 자동 주입.
   *  호출 시점의 "표시 중인 컬럼 defs(audit 포함, 표시 순서, 런타임 숨김 반영)" 를 반환하는 함수를 넘긴다. */
  onExcelColumnsReady?: (getExcelColumns: () => any[]) => void;
  /** 화면 model — popup 컬럼의 extraParams(row, model) 2번째 인자로 전달.
   *  다른 그리드 선택행 공유 등에 사용 (View 에서 model={model} 로 명시 전달). */
  model?: any;
  /** 마스킹(작업 차단) 오버레이 — true 면 그리드 위에 반투명 스피너 오버레이로 클릭/편집 차단.
   *  model.bind() 가 자동 주입(base.callAjax 가 토글). */
  loading?: boolean;
  /** 그리드 간 행 드래그 활성 — 첫 컬럼에 rowDrag 핸들 부여 (opt-in, 미지정 시 기존 동작). */
  rowDrag?: boolean;
  /** ag-grid GridApi 노출 — onGridReady 시 호출(내부 autosize 와 병행).
   *  그리드 간 드롭존(addRowDropZone) 배선 등 화면에서 api 가 필요할 때 사용. */
  onApiReady?: (api: any) => void;
};

export default function DataGrid<TRow>({
  tabs,
  presets,
  rowData = [],
  columnDefs = [],
  authId,
  layoutType = "tab",
  actions,
  subTitle,
  subTitleNoLang,
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
  onSelectionRowsChanged,
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
  activeTab: activeTabProp,
  audit,
  setRowData,
  readOnly,
  onColumnDefsReady,
  onExcelColumnsReady,
  model,
  loading,
  rowDrag,
  onApiReady,
}: DataGridProps<TRow>) {
  // columnDefs 가 바뀔 때마다 외부(useBaseModel slot)에 알린다.
  // saveGrid 의 required 검증이 columnDefsRef 로 메타 read.
  useEffect(() => {
    onColumnDefsReady?.(columnDefs as any[]);
  }, [columnDefs, onColumnDefsReady]);
  const { openPopup, closePopup } = usePopup();
  const [selectedRows, setSelectedRows] = useState<TRow[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(
    activeTabProp ?? tabs?.[0]?.key ?? null,
  );
  // 외부 제어(activeTabProp) 가 바뀌면 내부 활성 탭 동기화 — 사용자 클릭 전환은 그대로 유지.
  useEffect(() => {
    if (activeTabProp != null) setActiveTab(activeTabProp);
  }, [activeTabProp]);
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
    // 전체 행 드래그(rowDragEntireRow) 그리드는 셀 범위선택과 mousedown 충돌 → 셀선택 비활성.
    enabled: !gridOptions?.rowDragEntireRow,
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
    activeCodeMap,
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
    openPopup,
    closePopup,
    readOnly,
    model,
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

  // onGridReady — 내부 autosize + (옵션) 화면에 GridApi 노출(드롭존 배선용).
  const handleGridReadyAll = useCallback(
    (e: any) => {
      handleGridReady(e);
      gridApiRef.current = e.api;
      onApiReady?.(e.api);
    },
    [handleGridReady, onApiReady],
  );

  // rowDrag 활성 시 첫 leaf 컬럼에 드래그 핸들 주입(미지정 시 원본 그대로).
  const dragColumnDefs = useMemo(() => {
    if (!rowDrag) return finalColumnDefs;
    let injected = false;
    return (finalColumnDefs ?? []).map((c: any) => {
      if (injected || c?.children) return c;
      injected = true;
      return { ...c, rowDrag: true };
    });
  }, [finalColumnDefs, rowDrag]);

  // ── 엑셀 컬럼 getter ─────────────────────────────────────────────────────
  // activeColumnDefs(audit 포함, 커스텀 키 보존된 원본 defs) 를 grid api 의 표시 순서로 거른다.
  // → 런타임 숨김/순서변경이 그대로 반영된 "보이는 컬럼" defs. (엑셀 다운로드용)
  // codeKey 컬럼에는 그리드 codeMap(코드→명)을 codeLabels 로 붙여, 엑셀에서 라벨 치환/변환에 사용.
  const activeColumnDefsRef = useRef(activeColumnDefs);
  activeColumnDefsRef.current = activeColumnDefs;
  const activeCodeMapRef = useRef(activeCodeMap);
  activeCodeMapRef.current = activeCodeMap;
  const getExcelColumns = useCallback(() => {
    const cm = activeCodeMapRef.current as
      | Record<string, Record<string, string>>
      | undefined;
    const withLabels = (col: any) => {
      const codeKey = col?.codeKey as string | undefined;
      const labels = codeKey ? cm?.[codeKey] : undefined;
      return labels ? { ...col, codeLabels: labels } : col;
    };
    // 그룹(children) 컬럼을 leaf 로 평탄화 + 상위 헤더 체인(__excelHeaderGroups, 최상위→직속부모) 부착.
    // (평탄화 안 하면 그룹 안 leaf 가 byKey 매칭에서 빠져 엑셀에서 누락됨)
    const flatten = (cols: any[], ancestors: string[]): any[] => {
      const out: any[] = [];
      for (const col of cols ?? []) {
        if (col?.children) {
          out.push(...flatten(col.children, [...ancestors, col.headerName]));
        } else {
          const labeled = withLabels(col);
          out.push(
            ancestors.length
              ? { ...labeled, __excelHeaderGroups: ancestors }
              : labeled,
          );
        }
      }
      return out;
    };
    // excelPrint:false → 엑셀 제외.
    const defs = flatten(activeColumnDefsRef.current as any[], []).filter(
      (c) => (c as any).excelPrint !== false,
    );
    const api = gridApiRef.current;
    if (!api || api.isDestroyed?.()) return defs;
    const displayed = api.getAllDisplayedColumns?.() ?? [];
    if (displayed.length === 0) return defs;
    const byKey = new Map<string, any>();
    for (const c of defs) {
      const key = (c as any).colId ?? (c as any).field;
      if (key != null) byKey.set(key, c);
    }
    // 표시 중인 컬럼(표시 순서) — 런타임 숨김은 제외됨.
    const result = displayed
      .map((col: any) => byKey.get(col.getColId()))
      .filter(Boolean);
    // excelPrint:true 인데 화면 숨김(미표시)인 컬럼은 강제로 엑셀에 포함.
    const includedKeys = new Set(
      result.map((c: any) => c.colId ?? c.field),
    );
    const forced = defs.filter(
      (c: any) =>
        c.excelPrint === true && !includedKeys.has(c.colId ?? c.field),
    );
    return [...result, ...forced];
  }, []);
  useEffect(() => {
    onExcelColumnsReady?.(getExcelColumns);
  }, [onExcelColumnsReady, getExcelColumns]);

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

  // 리소스 권한 — authId 가 권한 매트릭스에 있고(통제 대상) 내 그룹 조회(S) 권한이
  // 없으면 그리드 비활성 (센차 grid setDisabled 대응). authId 미전달/통제 대상 아님 → 제한 없음.
  const access = useResourceAccess(authId);
  const gridDenied = isGridDenied(access);

  const wrappedActions = useMemo(
    () => wrapActions(activeActions, selectedRows, access.flags),
    [activeActions, selectedRows, access.flags],
  );

  const handlers = useGridHandlers<TRow>({
    setSelectedRows,
    prevSelectedRef,
    onRowSelected,
    activeOnRowClicked,
    onRowDoubleClicked,
    activeOnCellValueChanged,
    onSelectionChanged,
    onSelectionRowsChanged,
  });

  const { commonGridProps } = useGridProps<TRow>({
    finalColumnDefs: dragColumnDefs,
    summaryRow,
    handleGridReady: handleGridReadyAll,
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

  return (
    <div
      ref={gridContainerRef}
      className={GRID_WRAPPER_CLASS}
      style={{ position: "relative" }}
    >
      {/* 리소스 권한 없음 → 클릭 차단 + 딤 처리(센차 setDisabled 대응). */}
      {gridDenied && (
        <div
          className="absolute inset-0 z-[5] cursor-not-allowed bg-white/50"
          aria-hidden
        />
      )}
      {/* 마스킹(작업 차단) 오버레이 — base.callAjax 진행 중 클릭/편집 차단 + 스피너. */}
      {loading && (
        <div
          className="absolute inset-0 z-[6] flex items-center justify-center cursor-wait bg-white/50"
          aria-busy
        >
          <div className="h-6 w-6 rounded-full border-2 border-[rgb(var(--primary))] border-t-transparent animate-spin" />
        </div>
      )}
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
          subTitle={
            subTitle ? (subTitleNoLang ? subTitle : Lang.get(subTitle)) : undefined
          }
        />
      </div>

      <div className={GRID_BODY_CLASS}>
        {activeRender ? (
          activeRender()
        ) : (
          <div className={GRID_INNER_CLASS} style={GRID_CSS_VARS}>
            <AgGridReact<TRow>
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
