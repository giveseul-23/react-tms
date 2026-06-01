import { standardAudit } from "@/app/components/grid/columns/commonColumns";

export const MAIN_COLUMN_DEFS = (setGridData?: (updater: any) => void) => [
  {
    headerName: "No",
  }, {
    type: "text",
    headerName: "LBL_ID",
    field: "USR_ADT_ID",
    Locked: true,
  }, {
    type: "text",
    headerName: "LBL_MENU_CD",
    field: "MENU_CD",
    Locked: true,
  }, {
    type: "text",
    headerName: "LBL_MENU_NM",
    field: "MSG_DESC",
    Locked: true,
  }, {
    type: "text",
    headerName: "LBL_RQST_URL",
    field: "RQST_URL",
    Locked: true,
  }, {
    type: "text",
    headerName: "LBL_OWNER_ID",
    field: "OWNER_ID",
    Locked: true,
  }, {
    type: "text",
    headerName: "LBL_RQST_PARAM",
    field: "PARAM"
  }, {
    type: "text",
    headerName: "LBL_CLNT_IP",
    field: "CLNT_IP"
  },
  ...standardAudit(setGridData, { delete: false }),
];
