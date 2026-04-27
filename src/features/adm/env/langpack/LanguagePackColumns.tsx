import { makeAuditColumns } from "@/app/components/grid/commonColumns";

export const MAIN_COLUMN_DEFS = (setGridData?: (updater: any) => void) => [
  {
    headerName: "No",
  },
  {
    headerName: "LBL_MSG_CD",
    field: "MSG_CD",
  },
  {
    headerName: "LBL_LNG_PACK",
    field: "LANG_TP",
    codeKey: "langTypeList",
  },
  {
    headerName: "LBL_DESC",
    field: "MSG_DESC",
  },
  {
    headerName: "LBL_APPL_CD",
    field: "APPL_CD",
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
