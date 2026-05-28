import { ComboCellEditor } from "@/app/components/grid/cellEditors/ComboCellEditor";
import { standardAudit } from "@/app/components/grid/columns/commonColumns";

export const MAIN_COLUMN_DEFS = (
  setRows?: (updater: any) => void,
  resourceTypeMap: Record<string, string> = {},
) => [
  {
    type: "text",
    headerName: "LBL_PRNT_RSRC_ID",
    field: "PRNT_RSRC_ID",
    width: 200,
    editable: false,
    insertable: false,
  },
  {
    type: "text",
    headerName: "LBL_RSRC_DESC",
    field: "RSRC_DESC",
    width: 200,
    editable: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_MENU_NM",
    field: "MSG_DESC",
    width: 150,
    editable: false,
    insertable: false,
  },
  {
    type: "text",
    headerName: "LBL_RSRC_TP",
    field: "RSRC_TP",
    width: 100,
    align: "center",
    editable: false,
    insertable: true,
    cellEditor: ComboCellEditor,
    cellEditorParams: {
      codeMap: resourceTypeMap,
      setRowData: setRows,
    },
    cellEditorPopup: true,
    cellRenderer: (params: any) =>
      resourceTypeMap[String(params.value ?? "")] ?? params.value ?? "",
  },
  {
    type: "text",
    headerName: "LBL_INSERT_PERSON_ID",
    field: "CRE_USR_ID",
    width: 100,
    align: "center",
    editable: false,
    insertable: false,
  },
  {
    type: "date",
    headerName: "LBL_INSERT_DATE",
    field: "CRE_DTTM",
    width: 150,
    align: "center",
    editable: false,
    insertable: false,
  },
  ...standardAudit(setRows, {
    delete: true,
    deleteSetRowData: setRows,
    rowStatus: true,
    insertPerson: false,
    insertDate: false,
    updatePerson: false,
    updateTime: false,
  }),
];
