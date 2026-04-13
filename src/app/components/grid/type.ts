import type { ColDef, ColGroupDef } from "ag-grid-community";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";

export type GridTab = {
  key: string;
  label: string;
};

export type GridPreset<TRow> = {
  columnDefs: (ColDef<TRow> | ColGroupDef<TRow>)[];
  actions?: ActionItem[];
  onCellValueChanged?: (params: any) => void;
  onRowClicked?: (row: TRow) => void;
  gridRef?: React.RefObject<any>; // ← stopEditing 용
};
