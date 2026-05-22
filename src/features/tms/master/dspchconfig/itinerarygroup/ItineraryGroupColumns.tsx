export const MAIN_COLUMN_DEFS = [
  { headerName: "No" }, // 자동 일련번호
  {
    type: "text",
    headerName: "LBL_DIVISION_CODE",
    field: "DIV_CD",
  },
  {
    type: "text",
    headerName: "LBL_DIVISION_NAME",
    field: "DIV_NM",
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_DC_CODE",
    field: "LGST_GRP_CD"
  },
  {
    type: "text",
    headerName: "LBL_DC_NAME",
    field: "LGST_GRP_NM",
  },
  {
    type: "text",
    headerName: "LBL_ITNR_GRP_CD",
    field: "ITNR_GRP_CD",
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_ITNR_GRP_NM",
    field: "ITNR_GRP_NM",
    insertable: true,
    editable: true,
  },
  {
    type: "text",
    headerName: "LBL_ITNR_GRP_ALIAS",
    field: "ITNR_GRP_ALIAS",
    insertable: true,
    editable: true,
  },
  {
    type: "combo",
    headerName: "LBL_USE_YN",
    field: "USE_YN",
    codeKey: "ynList",
    insertable: true,
    editable: true,
  }
]