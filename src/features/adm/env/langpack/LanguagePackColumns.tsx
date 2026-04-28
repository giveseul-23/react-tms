import { makeAuditColumns } from "@/app/components/grid/commonColumns";

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
  },
  {
    type: "text",
    headerName: "LBL_APPL_CD",
    field: "APPL_CD",
    codeKey: "SELECT_APPLICATION_CODE_NAME",
  },
  ...makeAuditColumns({
    delete: true,
    deleteSetRowData: setGridData
      ? (updater: any) =>
          setGridData((prev: any) => ({
            ...prev,
            rows: typeof updater === "function" ? updater(prev.rows) : updater,
          }))
      : undefined,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];
