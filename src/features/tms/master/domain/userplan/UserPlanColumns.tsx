// 컬럼 끝의 standardAudit 은 DataGrid 가 audit prop(model.bind 자동) 으로 추가.

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_AUTHORIZED_USER",
    field: "USR_ID",
  },
  {
    type: "text",
    headerName: "LBL_AUTHORIZED_USER_NAME",
    field: "USR_NM",
    editable: true,
  },
  {
    type: "text",
    headerName: "LBL_PLAN_ID",
    field: "PLN_ID",
  },
  {
    type: "text",
    headerName: "LBL_PLAN_NAME",
    field: "PLN_NM",
  },
  {
    type: "text",
    headerName: "LBL_USE_CLASSIFICATION",
    field: "PLN_OP_DIV",
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
  },
  {
    type: "check",
    headerName: "LBL_DEFAULT",
    field: "DFT_YN",
  },
];
