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
  onRowSelected?: (row: TRow) => void;
};

export default function DataGrid<TRow>({
  tabs,
  presets,
  rowData = [],
  columnDefs = [],
  layoutType = "tab",
  gridHeightPx,
  actions,
  onRowSelected,
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

  /** ⭐ width 없는 컬럼만 autoSize */
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

  return (
    <div className="border border-gray-200 rounded-xl bg-[rgb(var(--bg))] flex flex-col h-full">
      {/* tabs */}
      {layoutType === "tab" && tabs && activeTab && (
        <div className="px-4">
          <GridTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
      )}

      {/* ⭐ ActionBar는 overflow-visible 레이어 */}
      <div className="relative z-50 overflow-visible shrink-0 min-w-0 w-full">
        <GridActionsBar actions={actions} />
      </div>

      {/* ⭐ Grid는 overflow-hidden 레이어 */}
      <div
        className={`grid-wrapper ${gridHeightPx ? "" : "flex-1 min-h-0 overflow-hidden"}`}
      >
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
  );
}
