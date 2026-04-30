import { standardAudit } from "@/app/components/grid/commonColumns";

export const MAIN_COLUMN_DEFS = (setGridData?: (updater: any) => void) => [
  {
    headerName: "No",
  },
  {
    type: "text",
    headerName: "LBL_MSG_CD",
    field: "MSG_CD",
  },
  {
    type: "text",
    headerName: "LBL_LNG_PACK",
    field: "LANG_TP",
    codeKey: "langTypeList",
  },
  {
    type: "text",
    headerName: "LBL_DESC",
    field: "MSG_DESC",
    editable: true,
  },
  {
    type: "combo",
    headerName: "LBL_APPL_CD",
    field: "APPL_CD",
    codeKey: "applCodeList",
    editable: true,
  },
  ...standardAudit(setGridData),
];
