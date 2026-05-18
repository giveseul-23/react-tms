// app/components/grid/useGridProps.ts
// ag-grid 에 spread 되는 prop 묶음을 메모. commonGridProps 의 reference 가 매 render
// 마다 바뀌면 ag-grid 가 cellEditor 등 내부 상태를 reset 하므로 deps 안정성이 중요.

import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import { MIN_COL_WIDTH } from "./autosize";

export function useGridProps<TRow>({
  finalColumnDefs,
  summaryRow,
  handleGridReady,
  handleFirstDataRendered,
  handleRowSelected,
  handleRowClicked,
  handleRowDoubleClicked,
  handleCellValueChanged,
  handleSelectionChanged,
  rowSelectionProp,
  headerCheckbox,
  treeData,
  getDataPath,
  autoGroupColumnDef,
  groupDefaultExpanded,
  gridOptions,
}: {
  finalColumnDefs: any[];
  summaryRow: any[] | undefined;
  handleGridReady: (e: any) => void;
  handleFirstDataRendered: (e: any) => void;
  handleRowSelected: (e: any) => void;
  handleRowClicked: (e: any) => void;
  handleRowDoubleClicked: (e: any) => void;
  handleCellValueChanged: (e: any) => void;
  handleSelectionChanged: (e: any) => void;
  rowSelectionProp?: string;
  headerCheckbox?: boolean;
  treeData?: boolean;
  getDataPath?: (data: TRow) => string[];
  autoGroupColumnDef?: ColDef<TRow>;
  groupDefaultExpanded?: number;
  gridOptions?: Record<string, any>;
}) {
  // ag-grid 에 흘러가는 prop 의 reference 를 안정화 — 부모 re-render 시에도
  // ag-grid 가 내부 상태(cellEditor 등) 를 reset 하지 않도록 한다.
  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      minWidth: MIN_COL_WIDTH,
      filter: true,
      floatingFilter: true,
    }),
    [],
  );

  const rowSelection = useMemo(() => {
    const hide = headerCheckbox === false;
    return rowSelectionProp === "single"
      ? {
          mode: "singleRow" as const,
          enableClickSelection: true,
          ...(hide && { checkboxes: false, headerCheckbox: false }),
        }
      : {
          mode: "multiRow" as const,
          enableClickSelection: false,
          ...(hide && { checkboxes: false, headerCheckbox: false }),
        };
  }, [rowSelectionProp, headerCheckbox]);

  const selectionColumnDef = useMemo(
    () => ({
      headerClass: "ag-selection-header-center",
      width: 30,
      minWidth: 30,
      maxWidth: 30,
    }),
    [],
  );

  const treeProps = useMemo(
    () =>
      treeData
        ? {
            treeData: true as const,
            getDataPath,
            autoGroupColumnDef,
            groupDefaultExpanded,
          }
        : null,
    [treeData, getDataPath, autoGroupColumnDef, groupDefaultExpanded],
  );

  const commonGridProps = useMemo(
    () => ({
      columnDefs: finalColumnDefs,
      pinnedBottomRowData: summaryRow,
      defaultColDef,
      headerHeight: 28,
      rowHeight: 22,
      onGridReady: handleGridReady,
      onFirstDataRendered: handleFirstDataRendered,
      // tree 모드는 getDataPath 가 row id 를 결정 — 충돌 방지로 getRowId 안 줌.
      ...(treeData ? {} : { getRowId: (p: any) => p.data?.__rid__ }),
      ...(treeProps ?? {}),
      onRowSelected: handleRowSelected,
      onSelectionChanged: handleSelectionChanged,
      onRowClicked: handleRowClicked,
      onRowDoubleClicked: handleRowDoubleClicked,
      onCellValueChanged: handleCellValueChanged,
      rowSelection,
      selectionColumnDef,
      // ─── Escape Hatch: 외부 gridOptions 오버라이드 (최종 우선순위) ──────────
      ...gridOptions,
    }),
    [
      finalColumnDefs,
      summaryRow,
      defaultColDef,
      handleGridReady,
      handleFirstDataRendered,
      treeProps,
      handleRowSelected,
      handleSelectionChanged,
      handleRowClicked,
      handleRowDoubleClicked,
      handleCellValueChanged,
      rowSelection,
      selectionColumnDef,
      gridOptions,
      treeData,
    ],
  );

  return { commonGridProps };
}
