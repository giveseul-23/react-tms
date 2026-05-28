export const MAIN_COLUMN_DEFS = [
  {
    headerName: "No",
  },
  {
    type: "text",
    headerName: "LBL_MSG_CD",
    field: "MSG_CD",
    editable: true,
    insertable: true,
  },
  {
    type: "combo",
    headerName: "LBL_LNG_PACK",
    field: "LANG_TP",
    codeKey: "langTypeList",
    editable: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_DESC",
    field: "MSG_DESC",
    editable: true,
    insertable: true,
    width: 180,
  },
  {
    type: "combo",
    headerName: "LBL_APPL_CD",
    field: "APPL_CD",
    codeKey: "applCodeList",
    editable: true,
    insertable: true,
  },
];
