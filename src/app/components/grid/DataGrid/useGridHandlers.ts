// app/components/grid/DataGrid/useGridHandlers.ts
// ag-grid 이벤트 콜백 모음. selectedRows state 동기화, prevSelectedRef 갱신,
// withRowStatusTracking 으로 EDIT_STS 자동 트래킹 포함.

import { useCallback, useMemo } from "react";
import { withRowStatusTracking } from "../gridCommon";

export function useGridHandlers<TRow>({
  setSelectedRows,
  prevSelectedRef,
  onRowSelected,
  activeOnRowClicked,
  onRowDoubleClicked,
  activeOnCellValueChanged,
  onSelectionChanged,
  onSelectionRowsChanged,
}: {
  setSelectedRows: React.Dispatch<React.SetStateAction<TRow[]>>;
  prevSelectedRef: React.MutableRefObject<TRow | null>;
  onRowSelected?: (row: TRow | null) => void;
  activeOnRowClicked?: (row: TRow) => void;
  onRowDoubleClicked?: (row: TRow) => void;
  activeOnCellValueChanged?: (params: any) => void;
  onSelectionChanged?: (row: any | null) => void;
  onSelectionRowsChanged?: (rows: any[]) => void;
}) {
  const handleRowSelected = useCallback(
    (e: any) => {
      if (!e.api) return;
      const rows = e.api.getSelectedRows();
      // 같은 selection 이면 state 변경 skip — re-render 시 cellEditor 영향 회피
      setSelectedRows((prev) => {
        if (
          prev.length === rows.length &&
          prev.every((r: any, i: number) => r === rows[i])
        ) {
          return prev;
        }
        return rows;
      });
      if (e.node.isSelected() && e.data) {
        prevSelectedRef.current = e.data;
        onRowSelected?.(e.data);
      } else {
        setTimeout(() => {
          if (e.api.getSelectedRows().length === 0) {
            onRowSelected?.(null);
          }
        }, 0);
      }
    },
    [onRowSelected, setSelectedRows, prevSelectedRef],
  );

  const handleRowClicked = useCallback(
    (e: any) => {
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
      prevSelectedRef.current = e.data;
      activeOnRowClicked?.(e.data);
    },
    [activeOnRowClicked, prevSelectedRef],
  );

  const handleRowDoubleClicked = useCallback(
    (e: any) => {
      if (!e.data) return;
      onRowDoubleClicked?.(e.data);
    },
    [onRowDoubleClicked],
  );

  const handleCellValueChanged = useMemo(
    () => withRowStatusTracking(activeOnCellValueChanged),
    [activeOnCellValueChanged],
  );

  // 사용자 액션에 의한 selection 변경만 외부로 전파.
  // rowDataChanged/api/gridInitializing/selectableChanged 등 자동 이벤트는 무시 —
  // 검색 결과 도착 시 onSearchCallback 이 명시적으로 박은 selectedRef 를 덮어쓰지 않도록.
  const USER_SELECTION_SOURCES = useMemo(
    () =>
      new Set([
        "rowClicked",
        "checkboxSelected",
        "spaceKey",
        "keyboardSelection",
        "uiSelectAll",
        "uiSelectAllCurrentPage",
        "uiSelectAllFiltered",
      ]),
    [],
  );

  const handleSelectionChanged = useCallback(
    (e: any) => {
      if (!onSelectionChanged && !onSelectionRowsChanged) return;
      if (!USER_SELECTION_SOURCES.has(e.source)) return;
      const rows = e.api.getSelectedRows();
      onSelectionChanged?.(rows.length === 0 ? null : rows[0]);
      onSelectionRowsChanged?.(rows);
    },
    [onSelectionChanged, onSelectionRowsChanged, USER_SELECTION_SOURCES],
  );

  return {
    handleRowSelected,
    handleRowClicked,
    handleRowDoubleClicked,
    handleCellValueChanged,
    handleSelectionChanged,
  };
}
