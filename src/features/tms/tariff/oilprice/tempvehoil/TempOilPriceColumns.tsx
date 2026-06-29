// ── 탭 A 좌측: 물류운영그룹 목록 ───────────────────────────────
export const MASTER_COLUMN_DEFS = [
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

// ── 탭 A 우측: 선택된 그룹의 유가 상세 ────────────────────────
export const OIL_PRICE_COLUMN_DEFS = [
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
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
    headerName: "LBL_CF_OIL_PRICE_ID",
    field: "OIL_PRICE_ID",
  },
  {
    type: "date",
    headerName: "LBL_FROM_DTTM",
    field: "FRM_DT",
    required: true,
    insertable: true,
  },
  {
    type: "date",
    headerName: "LBL_TO_DTTM",
    field: "TO_DT",
    required: true,
    insertable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_CF_OIL_PRICE",
    field: "OIL_PRICE",
    required: true,
    insertable: true,
  }
];

// ── 탭 B: 기간별 조회 ──────────────────────────────────────────
export const PERIOD_COLUMN_DEFS = [
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
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
    headerName: "LBL_CF_OIL_PRICE_ID",
    field: "OIL_PRICE_ID",
  },
  {
    type: "date",
    headerName: "LBL_FROM_DATE",
    field: "FRM_DT",
  },
  {
    type: "date",
    headerName: "LBL_TO_DTTM",
    field: "TO_DT",
  },
  {
    type: "numeric",
    headerName: "LBL_CF_OIL_PRICE",
    field: "OIL_PRICE",
  }
];
