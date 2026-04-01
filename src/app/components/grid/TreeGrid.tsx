"use client";

import React, { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

type TreeGridProps<TRow> = {
  rowData: TRow[];
  columnDefs: ColDef<TRow>[];

  getRowId?: (params: any) => string;

  gridOptions?: Record<string, any>;
};

export default function TreeGrid<TRow>({
  rowData,
  columnDefs,
  getRowId,
  gridOptions,
}: TreeGridProps<TRow>) {
  // ✅ DataGrid 스타일 그대로 가져옴
  const gridStyle = {
    ["--ag-font-size" as any]: "11px",
    ["--ag-header-font-size" as any]: "11px",
    ["--ag-row-height" as any]: "22px",
    ["--ag-header-height" as any]: "22px",
    ["--ag-cell-horizontal-padding" as any]: "3px",
    ["--ag-cell-vertical-padding" as any]: "1px",
    ["--ag-grid-size" as any]: "3px",
  };

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: false,
      filter: true,
      floatingFilter: true,
      minWidth: 80,
    }),
    [],
  );

  return (
    <div className="border border-gray-200 rounded-lg bg-[rgb(var(--bg))] flex flex-col h-full min-h-0">
      <div
        className="ag-theme-quartz ag-theme-bridge w-full h-full"
        style={gridStyle}
      >
        <AgGridReact<TRow>
          theme="legacy"
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          headerHeight={22}
          rowHeight={22}
          getRowId={getRowId}
          suppressMovableColumns
          suppressCellFocus
          {...gridOptions} // escape hatch
        />
      </div>
    </div>
  );
}
