export const MAIN_COLUMN_DEFS = [
  { headerName: "No" }, // 자동 일련번호
  {
    type: "text",
    headerName: "LBL_AR_SUB_CHG_CD",
    field: "AR_SUBCHG_CD",
    required: true,
    insertable: true,
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_AR_SUB_CHG_NM",
    field: "AR_SUB_CHG_NM",
    required: true,
    insertable: true,
    editable: true,
  },
  {
    type: "text",
    headerName: "LBL_REMARK",
    field: "RMK",
    insertable: true,
    editable: true,
  },
  {
    type: "check",
    headerName: "LBL_USE_YN",
    field: "USE_YN",
    insertable: true,
    editable: true,
  },
];
