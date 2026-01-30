import type { ColDef, ColGroupDef } from "ag-grid-community";

export type GridTab = {
  key: string; // 완전 자유 (DB/화면 정의)
  label: string; // 탭 타이틀
};

export type GridPreset<TRow> = {
  columnDefs: (ColDef<TRow> | ColGroupDef<TRow>)[];
  rowData: TRow[];
};
