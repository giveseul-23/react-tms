"use client";
// app/components/grid/DataGrid.tsx

import { ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

import React, { useMemo, useState, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  ColGroupDef,
  GridReadyEvent,
  ValueGetterParams,
} from "ag-grid-community";

import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

import { GridTabs } from "./GridTabs";
import type { GridPreset, GridTab } from "./types";
import { GridActionsBar, ActionItem } from "@/app/components/ui/GridActionsBar";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

type DataGridProps<TRow> = {
  tabs?: GridTab[];
  presets?: Record<string, GridPreset<TRow>>;

  rowData?: TRow[];
  columnDefs?: (ColDef<TRow> | ColGroupDef<TRow>)[];

  layoutType?: "tab" | "plain";
  actions: ActionItem[];

  pagination?: boolean;
  pageSize?: number;

  onRowSelected?: (row: TRow) => void;
  renderRightGrid?: (activeTabKey: string) => React.ReactNode;

  disableAutoSize?: boolean;
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
}: DataGridProps<TRow>) {
  const [activeTab, setActiveTab] = useState<string | null>(
    tabs?.[0]?.key ?? null,
  );

  const activePreset = useMemo(() => {
    if (layoutType === "tab" && activeTab && presets) {
      return presets[activeTab];
    }
    return { rowData, columnDefs };
  }, [layoutType, activeTab, presets, rowData, columnDefs]);

  /** No 컬럼 처리 */
  const finalColumnDefs = useMemo(() => {
    return activePreset.columnDefs.map((col) => {
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

      // 공통코드에서 maxWidth 설정안되게 수정
      if ((col as any).disableMaxWidth === true) {
        return {
          ...col,
          maxWidth: null, // ⭐ 반드시 명시
        };
      }

      return col;
    });
  }, [activePreset]);

  const rowSelection = useMemo(
    () => ({
      mode: "multiRow" as const,
      enableClickSelection: true,
      enableSelectionWithoutKeys: true,
    }),
    [],
  );

  /** 컬럼 autosize
   * todo : columAPi - getAllColumns, autoSizeColumns
   *
   */
  const handleGridReady = useCallback((e: GridReadyEvent) => {
    requestAnimationFrame(() => {
      if (disableAutoSize) return;

      const autoSizeColIds: string[] = [];
      e.columnApi.getAllColumns()?.forEach((col) => {
        const def = col.getColDef();
        if (def.width == null && def.flex == null) {
          autoSizeColIds.push(col.getId());
        }
      });
      if (autoSizeColIds.length) {
        e.columnApi.autoSizeColumns(autoSizeColIds, false);
      }
    });
  }, []);

  const rightGrid =
    layoutType === "tab" && activeTab && renderRightGrid
      ? renderRightGrid(activeTab)
      : null;

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
        <GridActionsBar actions={actions} />
      </div>

      {/* Grid */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {rightGrid ? (
          <PanelGroup direction="horizontal" className="h-full w-full">
            <Panel defaultSize={70} minSize={30}>
              <div className="h-full">
                <div
                  className="ag-theme-quartz ag-theme-bridge w-full h-full"
                  style={{
                    // ⭐ 밀도만 줄이기 (기존 CSS 유지)
                    ["--ag-font-size" as any]: "12px",
                    ["--ag-cell-horizontal-padding" as any]: "6px",
                  }}
                >
                  <AgGridReact<TRow>
                    theme="legacy"
                    rowData={activePreset.rowData}
                    columnDefs={finalColumnDefs}
                    defaultColDef={{
                      resizable: true,
                      sortable: true,
                      minWidth: 80, // ⭐ 핵심
                      maxWidth: 120,
                      // quickFilter
                      filter: true,
                      floatingFilter: true, //header에서 바로보이게
                    }}
                    headerHeight={30} // ⭐
                    rowHeight={34} // ⭐
                    rowSelection={rowSelection as any}
                    onGridReady={handleGridReady}
                    onRowSelected={(e) => {
                      if (e.type === "rowSelected" && e.data) {
                        onRowSelected?.(e.data);
                      }
                    }}
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
            style={{
              ["--ag-font-size" as any]: "12px",
              ["--ag-cell-horizontal-padding" as any]: "6px",
            }}
          >
            <AgGridReact<TRow>
              theme="legacy"
              rowData={activePreset.rowData}
              columnDefs={finalColumnDefs}
              defaultColDef={{
                resizable: true,
                sortable: true,
                minWidth: 80,
                maxWidth: 120,
                // quickFilter
                filter: true,
                floatingFilter: true, //header에서 바로보이게
              }}
              headerHeight={30}
              rowHeight={34}
              pagination={pagination}
              paginationPageSize={pageSize}
              paginationPageSizeSelector={[10, 20, 50, 100]}
              rowSelection={rowSelection as any}
              onGridReady={handleGridReady}
            />
          </div>
        )}
      </div>
    </div>
  );
}
