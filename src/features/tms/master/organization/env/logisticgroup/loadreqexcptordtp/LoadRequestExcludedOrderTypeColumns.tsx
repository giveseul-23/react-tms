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
    type: "text",
    headerName: "LBL_ORD_TP_CD",
    field: "ORD_TP_CD",
  },
  {
    type: "text",
    headerName: "LBL_ORD_TP_NM",
    field: "ORD_TP_NM",
  },
];