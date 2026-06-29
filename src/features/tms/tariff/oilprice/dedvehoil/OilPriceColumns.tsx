// ── 탭1 좌측: 물류운영그룹 ─────────────────────────────────────
export const MASTER_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
    align: "center",
    flex: 1,
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
    align: "left",
    flex: 1,
  },
];

// ── 탭1 우측: 자차 유가 상세 ───────────────────────────────────
export const DF_OIL_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
    align: "center",
    width: 120,
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
    align: "left",
    width: 140,
  },{
    type: "popup",
    headerName: "LBL_CARRIER_CODE",
    field: "CARR_CD",
    nameField: "CARR_NM",
    sqlId: "selectCarrListWithLgst",
    popupTitle: "LBL_CARRIER_CODE",
    required: true,
    insertable: true,
    align: "center",
    width: 130,
    extraParams: (row) => ({ keyParam: row?.LGST_GRP_CD ?? "" }),
  },{
    type: "text",
    headerName: "LBL_CARRIER_NAME",
    field: "CARR_NM",
    align: "left",
    width: 120,
  },
  {
    type: "text",
    headerName: "LBL_DF_OIL_PRICE_ID",
    field: "OIL_PRICE_ID",
    align: "center",
    width: 160,
  },
  {
    type: "date",
    headerName: "LBL_FROM_DTTM",
    field: "FRM_DT",
    align: "center",
    required: true,
    insertable: true,
    editable: true,
  },
  {
    type: "date",
    headerName: "LBL_TO_DTTM",
    field: "TO_DT",
    align: "center",
    required: true,
    insertable: true,
    editable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_OIL_PRICE",
    field: "OIL_PRICE",
    align: "right",
    required: true,
    insertable: true,
    editable: true,
  }
];

// ── 탭2: 월별 유가 조회 ────────────────────────────────────────
export const MONTH_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
    align: "center",
    width: 150,
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
    align: "left",
    width: 150,
  }, {
    type: "text",
    headerName: "LBL_CARRIER_CODE",
    field: "CARR_CD",
    align: "left",
    width: 120,
  },{
    type: "text",
    headerName: "LBL_CARRIER_NAME",
    field: "CARR_NM",
    align: "left",
    width: 120,
  },
  {
    type: "text",
    headerName: "LBL_DF_OIL_PRICE_ID",
    field: "OIL_PRICE_ID",
    align: "center",
  },
  {
    type: "date",
    headerName: "LBL_FROM_DTTM",
    field: "FRM_DT",
    align: "center",
  },
  {
    type: "date",
    headerName: "LBL_TO_DTTM",
    field: "TO_DT",
    align: "center",
  },
  {
    type: "numeric",
    headerName: "LBL_OIL_PRICE",
    field: "OIL_PRICE",
    align: "right",
  }
];
