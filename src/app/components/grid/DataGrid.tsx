"use client";
// app/lib/agGrid.ts
import { ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

import React, { useMemo, useState } from "react";
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
// import "ag-grid-community/styles/ag-theme-quartz-dark.css";

type DataGridProps<TRow> = {
  /** tab 모드 */
  tabs?: GridTab[];
  presets?: Record<string, GridPreset<TRow>>;

  /** plain 모드 */
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

  const finalColumnDefs = useMemo(() => {
    return activePreset.columnDefs.map((col) => {
      if (col.headerName === "No") {
        return {
          ...col,
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

  return (
    <div className="border border-gray-200 rounded-xl bg-[rgb(var(--bg))] flex flex-col h-full min-h-0">
      {/* tabs */}
      {layoutType === "tab" && tabs && activeTab && (
        <div className="px-4">
          <GridTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
      )}

      {/* actions */}
      <GridActionsBar actions={actions} />

      {/* grid */}
      <div
        className={`grid-wrapper ${gridHeightPx ? "" : "flex-1 min-h-0"}`}
        style={gridHeightPx ? { height: gridHeightPx } : undefined}
      >
        <div className="ag-theme-quartz ag-theme-bridge w-full h-full">
          <AgGridReact<TRow>
            theme="legacy"
            rowData={activePreset.rowData}
            columnDefs={finalColumnDefs}
            defaultColDef={{ resizable: true, sortable: true }}
            headerHeight={36}
            rowHeight={40}
            rowSelection={rowSelection as any}
            onGridReady={(e: GridReadyEvent) => {
              requestAnimationFrame(() => e.api.sizeColumnsToFit());
            }}
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
