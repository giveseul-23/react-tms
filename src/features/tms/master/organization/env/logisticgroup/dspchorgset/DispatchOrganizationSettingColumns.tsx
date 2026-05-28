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
    headerName: "LBL_RULE_ID",
    field: "RULE_ID",
  },
  {
    type: "combo",
    headerName: "LBL_SHPM_TP",
    field: "SHPM_TP",
    codeKey: "shpmTpList",
    insertable: true,
    editable: true,
  },
  {
    type: "text",
    headerName: "LBL_PLANT_CD",
    field: "PLANT_CD",
    insertable: true,
    editable: true,
  },
  {
    type: "text",
    headerName: "LBL_SHPNT_CD",
    field: "SHPNG_PNT_CD",
    insertable: true,
    editable: true,
  },
  {
    type: "text",
    headerName: "LBL_SLOC_CD",
    field: "STRG_LOC_CD",
    insertable: true,
    editable: true,
  },
  {
    type: "combo",
    headerName: "LBL_REVERSE_YN",
    field: "REVERSE_YN",
    codeKey: "ynList",
    insertable: true,
    editable: true,
  },
  {
    type: "text",
    headerName: "LBL_REMARK_THIRD",
    field: "PRIORITY",
  },
];