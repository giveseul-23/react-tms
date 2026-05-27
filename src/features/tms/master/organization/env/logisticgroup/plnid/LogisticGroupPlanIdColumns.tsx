export const MAIN_COLUMN_DEFS = [
  { headerName: "No" }, 
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
  },
];

// ── 상세 그리드 컬럼 ───────────────────────────────────────────────
export const DETAIL_COLUMN_DEFS = [
  { headerName: "No" },
    {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
    hide: true, 
  },
  {
    type: "numeric",
    headerName: "LBL_PLAN_ID",
    field: "PLN_ID",
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_PLAN_NAME",
    field: "PLN_NM",
    insertable: true,
  },
  {
    type: "combo",
    headerName: "LBL_USE_CLASSIFICATION",
    field: "PLN_OP_DIV",
    codeKey: "plnOpDiv",
    insertable: true,
    editable: true,
  },
  {
    type: "combo",
    headerName: "LBL_SETTOPLN_ALLWD_YN",
    field: "ALW_SET_TO_PLN_YN",
    codeKey: "ynList",
    insertable: true,
    editable: true,
  },
  {
    type: "combo",
    headerName: "LBL_DEFAULT",
    field: "DFT_YN",
    codeKey: "ynList",
    insertable: true,
    editable: true,
  },
];