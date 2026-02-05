"use client";
// app/lib/agGrid.ts
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
  gridHeightPx?: number;
  actions: ActionItem[];

  pagination?: boolean;
  pageSize?: number;

  onRowSelected?: (row: TRow) => void;

  renderRightGrid?: (activeTabKey: string) => React.ReactNode;
};

export default function DataGrid<TRow>({
  tabs,
  presets,
  rowData = [],
  columnDefs = [],
  layoutType = "tab",
  gridHeightPx,
  actions,
  pagination = false,
  pageSize = 20,
  onRowSelected,
  renderRightGrid,
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

  const finalColumnDefs = useMemo(() => {
    return activePreset.columnDefs.map((col) => {
      if ("headerName" in col && col.headerName === "No") {
        return {
          ...col,
          width: 60,
          valueGetter: (params: ValueGetterParams<TRow>) =>
            (params.node?.rowIndex ?? 0) + 1,
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

  const handleGridReady = useCallback((e: GridReadyEvent) => {
    requestAnimationFrame(() => {
      const autoSizeColIds: string[] = [];
      e.columnApi.getAllColumns()?.forEach((col) => {
        const def = col.getColDef();
        if (def.width == null && def.flex == null) {
          autoSizeColIds.push(col.getId());
        }
      });
      if (autoSizeColIds.length > 0) {
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
      {layoutType === "tab" && tabs && activeTab && (
        <div className="px-4 shrink-0">
          <GridTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
      )}

      <div className="relative z-50 overflow-visible shrink-0 min-w-0 w-full">
        <GridActionsBar actions={actions} />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {rightGrid ? (
          <PanelGroup direction="horizontal" className="h-full w-full">
            {/* LEFT */}
            <Panel defaultSize={70} minSize={30}>
              <div className="flex flex-col h-full min-h-0 min-w-0">
                <div className="flex-1 min-h-0">
                  <div className="ag-theme-quartz ag-theme-bridge w-full h-full">
                    <AgGridReact<TRow>
                      theme="legacy"
                      rowData={activePreset.rowData}
                      columnDefs={finalColumnDefs}
                      defaultColDef={{
                        resizable: true,
                        sortable: true,
                        minWidth: 100,
                        maxWidth: 300,
                      }}
                      headerHeight={36}
                      rowHeight={40}
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
              </div>
            </Panel>

            <PanelResizeHandle className="w-2 cursor-col-resize bg-transparent hover:bg-slate-200/70" />

            {/* RIGHT */}
            <Panel defaultSize={30} minSize={20}>
              <div className="flex flex-col h-full min-h-0 min-w-0 border-l border-gray-200 bg-white">
                <div className="flex-1 min-h-0">{rightGrid}</div>
              </div>
            </Panel>
          </PanelGroup>
        ) : (
          <div className="ag-theme-quartz ag-theme-bridge w-full h-full">
            <AgGridReact<TRow>
              theme="legacy"
              rowData={activePreset.rowData}
              columnDefs={finalColumnDefs}
              defaultColDef={{
                resizable: true,
                sortable: true,
                minWidth: 100,
                maxWidth: 300,
              }}
              headerHeight={36}
              rowHeight={40}
              /* ⭐ 페이징 */
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
