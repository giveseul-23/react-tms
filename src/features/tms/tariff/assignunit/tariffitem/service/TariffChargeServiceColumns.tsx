export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_DISPATCH_RATE_SVC_CD",
    field: "SUBCHG_CD",
    isPrimaryKey: true,
    required: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_DISPATCH_RATE_SVC_NM",
    field: "SUBCHG_NM",
    required: true,
    insertable: true,
    editable: true,
  },
];
