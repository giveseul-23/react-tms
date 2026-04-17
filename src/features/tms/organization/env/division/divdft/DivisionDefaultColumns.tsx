import { makeAuditColumns } from "@/app/components/grid/commonColumns";

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    headerName: "LBL_SETTING_ITEM",
    field: "CNFG_NM",
  },
];

export const DETAIL_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_DIVISION_CODE", field: "DIV_CD" },
  { headerName: "LBL_DIVISION_NAME", field: "DIV_NM" },
  { headerName: "LBL_SETTING_VAL", field: "CNFG_DTL_CD" },
  ...makeAuditColumns({
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];
