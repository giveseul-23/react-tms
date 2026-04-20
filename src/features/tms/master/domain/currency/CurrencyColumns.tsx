import { makeAuditColumns } from "@/app/components/grid/commonColumns";

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    headerName: "LBL_CURRENCY_CODE",
    field: "CURR_CD",
  },
  { headerName: "LBL_CURRENCY_NAME", field: "CURR_NM" },
  { headerName: "LBL_DECIMAL_PRECISION", field: "DECIMAL_PRECISION" },
  {
    headerName: "LBL_CURR_RDNG_RCD",
    field: "CURR_RDNG_RCD",
    codeKey: "currRdngRcd",
  },
  { headerName: "LBL_DSPL_ORD", field: "DSPLY_SEQ" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];
