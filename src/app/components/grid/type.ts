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
  codeMap?: Record<string, Record<string, string>>;
  gridRef?: React.RefObject<any>; // ← stopEditing 용
  /** 탭 컨텐츠를 통째로 커스텀 렌더. SplitPane 등 복합 레이아웃용. */
  render?: () => React.ReactNode;
};
