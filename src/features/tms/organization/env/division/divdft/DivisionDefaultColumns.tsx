import { standardAudit } from "@/app/components/grid/commonColumns";

export const MAIN_COLUMN_DEFS = (setGridData?: (updater: any) => void) => [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_SETTING_ITEM",
    field: "CNFG_NM",
  },
];

export const DETAIL_COLUMN_DEFS = (setGridData?: (updater: any) => void) => [
  { headerName: "No" },
  { type: "text", headerName: "LBL_DIVISION_CODE", field: "DIV_CD" },
  { type: "text", headerName: "LBL_DIVISION_NAME", field: "DIV_NM" },
  { type: "text", headerName: "LBL_SETTING_VAL", field: "CNFG_DTL_CD" },
  ...standardAudit(setGridData),
];
