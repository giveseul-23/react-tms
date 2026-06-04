export const MAIN_COLUMN_DEFS = [
  {
    headerName: "No",
  },
  {
    type: "text",
    headerName: "LBL_APPL_CD",
    field: "APPL_CD",
    editable: true,
    insertable: true,
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_APPL_NM",
    field: "APPL_NM",
    editable: true,
    insertable: true,
  },
  {
    type: "combo",
    headerName: "LBL_USE_YN",
    field: "USE_YN",
    codeKey: "useYn",
    editable: true,
    insertable: true,
  },
];
