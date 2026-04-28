import { standardAudit } from "@/app/components/grid/commonColumns";

export const MAIN_COLUMN_DEFS = (setGridData?: (updater: any) => void) => [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_CURRENCY_CODE",
    field: "CURR_CD",
  },
  { type: "text", headerName: "LBL_CURRENCY_NAME", field: "CURR_NM" },
  {
    type: "numeric",
    headerName: "LBL_DECIMAL_PRECISION",
    field: "DECIMAL_PRECISION",
  },
  {
    type: "text",
    headerName: "LBL_CURR_RDNG_RCD",
    field: "CURR_RDNG_RCD",
    codeKey: "currRdngRcd",
  },
  { type: "numeric", headerName: "LBL_DSPL_ORD", field: "DSPLY_SEQ" },
  ...standardAudit(setGridData),
];
