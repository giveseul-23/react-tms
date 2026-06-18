export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_DIVISION_CODE",
    field: "DIV_CD",
  },
  {
    type: "text",
    headerName: "LBL_DIVISION_NAME",
    field: "DIV_NM",
  },
  {
    type: "text",
    headerName: "LBL_DISPATCH_RATE_CD",
    field: "TRF_CD",
    isPrimaryKey: true,
  },
  {
    type: "text",
    headerName: "LBL_TARIFF_NAME",
    field: "TRF_NM",
  },
  {
    type: "text",
    headerName: "LBL_PAY_CARRIER_CODE",
    field: "PAY_CARR_CD",
  },
  {
    type: "text",
    headerName: "LBL_PAY_CARRIER_NAME",
    field: "PAY_CARR_NM",
  },
  {
    type: "date",
    headerName: "LBL_FROM_DTTM",
    field: "FRM_DTTM",
    required: true,
    editable: true,
    insertable: true,
  },
  {
    type: "date",
    headerName: "LBL_TO_DTTM",
    field: "TO_DTTM",
    required: true,
    editable: true,
    insertable: true,
  },
  {
    type: "check",
    headerName: "LBL_JOB_USE_YN",
    field: "USE_YN",
    editable: true,
  },
];

export const DETAIL_LEFT_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", field: "TRF_CD", hide: true },
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

export const DETAIL_RIGHT_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", field: "TRF_CD", hide: true },
  { type: "text", field: "LGST_GRP_CD", hide: true },
  { type: "text", field: "ALW_RATE_UPD_YN", hide: true },
  {
    type: "text",
    headerName: "LBL_RATE_ITEM_CD",
    field: "CHG_CD",
  },
  {
    type: "text",
    headerName: "LBL_RATE_ITEM_NAME",
    field: "CHG_NM",
  },
  {
    type: "combo",
    headerName: "LBL_OVRHD_CHG_TP",
    field: "OVRHD_CHG_TP",
    codeKey: "ovrhdChgType",
    required: true,
    editable: true,
    insertable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_UNIT_COST",
    field: "UNIT_RATE",
    editable: true,
    insertable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_APPLIED_VAL",
    field: "APPLD_VAL",
    editable: true,
    insertable: true,
  },
];
