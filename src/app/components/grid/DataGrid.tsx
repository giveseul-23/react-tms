"use client";
// app/components/grid/DataGrid.tsx

import React, { useMemo, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);
import type { ColDef, ColGroupDef, ValueGetterParams } from "ag-grid-community";

import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

import { GridTabs } from "./GridTabs";
import type { GridPreset, GridTab } from "./types";
import { GridActionsBar, ActionItem } from "@/app/components/ui/GridActionsBar";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
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

  // preset에 gridRef가 없을 때 사용할 내부 ref
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

  // preset의 onCellValueChanged 우선, 없으면 prop 사용
  const activeOnCellValueChanged = useMemo(() => {
    if (layoutType === "tab" && activeTab && presets) {
      return presets[activeTab].onCellValueChanged ?? onCellValueChanged;
    }
    return onCellValueChanged;
  }, [layoutType, activeTab, presets, onCellValueChanged]);

  // preset의 gridRef 우선, 없으면 내부 ref 사용
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

  // 공통 AgGridReact props
  const commonGridProps = {
    theme: "legacy" as const,
    columnDefs: finalColumnDefs,
    defaultColDef: {
      resizable: true,
      sortable: true,
      minWidth: 80,
      filter: true,
      floatingFilter: true,
    },
    headerHeight: 22,
    rowHeight: 22,
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
    onFirstDataRendered: (e: any) => {
      const updatedDefs = e.api.getColumnDefs()?.map((col: any) => ({
        ...col,
        maxWidth: 120,
      }));
      if (updatedDefs) {
        e.api.setGridOption("columnDefs", updatedDefs);
      }
    },
    onCellValueChanged: activeOnCellValueChanged,
    rowSelection:
      rowSelectionProp === "single"
        ? { mode: "singleRow" as const, enableClickSelection: true }
        : { mode: "multiRow" as const },
  };

  // 공통 그리드 스타일
  const gridStyle = {
    ["--ag-font-size" as any]: "11px",
    ["--ag-header-font-size" as any]: "11px",
    ["--ag-row-height" as any]: "22px",
    ["--ag-header-height" as any]: "22px",
    ["--ag-cell-horizontal-padding" as any]: "3px",
    ["--ag-cell-vertical-padding" as any]: "1px",
    ["--ag-grid-size" as any]: "3px",
  };

  // 페이지네이션 UI
  const PaginationBar = () => {
    if (totalCount == null) return null;
    return (
      <div className="flex items-center justify-center gap-2 py-1 border-t shrink-0 text-xs">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange?.(1)}
          className="px-2 py-0.5 border rounded disabled:opacity-40 hover:bg-gray-100"
        >
          «
        </button>
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange?.((currentPage ?? 1) - 1)}
          className="px-2 py-0.5 border rounded disabled:opacity-40 hover:bg-gray-100"
        >
          ‹
        </button>
        <span className="text-gray-600">
          {currentPage} / {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange?.((currentPage ?? 1) + 1)}
          className="px-2 py-0.5 border rounded disabled:opacity-40 hover:bg-gray-100"
        >
          ›
        </button>
        <button
          disabled={currentPage === totalPages}
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
      {/* Tabs */}
      {layoutType === "tab" && tabs && activeTab && (
        <div className="px-4 shrink-0">
          <GridTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
      )}

      {/* Actions */}
      <div className="relative z-1 shrink-0 min-w-0 w-full">
        <GridActionsBar actions={wrappedActions} />
      </div>

      {/* Grid */}
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

      {/* 서버 페이지네이션 */}
      <PaginationBar />
    </div>
  );
}
