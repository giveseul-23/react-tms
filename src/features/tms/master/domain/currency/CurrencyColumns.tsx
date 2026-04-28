import { makeAuditColumns } from "@/app/components/grid/commonColumns";

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_CURRENCY_CODE",
    field: "CURR_CD",
  },
  { type: "text", headerName: "LBL_CURRENCY_NAME", field: "CURR_NM" },
  { type: "text", headerName: "LBL_DECIMAL_PRECISION", field: "DECIMAL_PRECISION" },
  {
    type: "text",
    headerName: "LBL_CURR_RDNG_RCD",
    field: "CURR_RDNG_RCD",
    codeKey: "currRdngRcd",
  },
  { type: "text", headerName: "LBL_DSPL_ORD", field: "DSPLY_SEQ" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];
