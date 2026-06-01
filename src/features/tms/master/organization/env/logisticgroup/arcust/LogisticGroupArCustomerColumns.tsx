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
    headerName: "LGST_GRP_CUST_ID",
    field: "LGST_GRP_CUST_ID",
    hide: true, 
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
    hide: true, 
  },
  {
    type: "popup",
    headerName: "LBL_CUSTOMER_CODE",
    field: "CUST_CD",
    nameField: "CUST_NM",  
    sqlId: "selectCustomerCodeName",
    required: true,
    insertable: true,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_CUSTOMER_NAME",
    field: "CUST_NM",
    required: true,
  },
  {
    type: "check",
    headerName: "LBL_DEFAULT",
    field: "DFT_YN",
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