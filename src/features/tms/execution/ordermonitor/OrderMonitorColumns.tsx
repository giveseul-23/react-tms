// 그리드 컬럼 정의 (서버 OrderMonitorMain / Sub01 / Sub02 기준)
// 운송주문 모니터링 — 전 컬럼 읽기전용(서버 editDisabled/insertDisabled). audit 컬럼은 OMIT.

// ── 메인: 운송주문 ────────────────────────────────────────────────
export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "numeric", headerName: "LBL_SHIPMENT_ID", field: "SHPM_ID", align: "center", width: 150, locked: true, hide: true },
  { type: "date", headerName: "LBL_REQUESTED_DELIVERY_DATE", field: "DLVRY_DT", align: "center", width: 150, locked: true },
  { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO", align: "center", width: 150, locked: true },
  { type: "text", headerName: "LBL_PLAN_ID", field: "PLN_ID", align: "center", width: 100, locked: true },
  { type: "text", headerName: "LBL_PLAN_NAME", field: "PLN_NM", align: "left", width: 100, locked: true },
  { type: "text", headerName: "LBL_ORDER_NO", field: "ORD_NO", align: "center", width: 150, locked: true },
  { type: "text", headerName: "LBL_MIT_CODE_NAME", field: "MIT_CLSS_CD", align: "center", width: 150, hide: true },
  { type: "combo", headerName: "LBL_SHIPMENT_OP_STATUS", field: "SHPM_OP_STS", statusStyle: "SHPM_OP_STS", codeKey: "shpmOpStsList", align: "center", width: 150 },
  { type: "combo", headerName: "LBL_ORDER_TYPE", field: "ORD_TP", codeKey: "ordTpList", align: "center", width: 100 },
  { type: "text", headerName: "LBL_CUSTOMER_ORDER_NO", field: "CUST_ORD_NO", align: "center", width: 150 },
  { type: "text", headerName: "LBL_SHIPMENT_NUMBER", field: "SHPM_NO", align: "center", width: 150 },
  { type: "text", headerName: "LBL_CUSTOMER_CODE", field: "CUST_CD", align: "center", width: 150 },
  { type: "text", headerName: "LBL_CUSTOMER_NAME", field: "CUST_NM", align: "left", width: 150 },
  { type: "text", headerName: "LBL_DEPARTURE_CODE", field: "FRM_LOC_CD", align: "center", width: 150 },
  { type: "text", headerName: "LBL_DEPARTURE_NAME", field: "FRM_LOC_NM", align: "left", width: 150 },
  { type: "text", headerName: "LBL_DEPARTURE_ADDRESS", field: "FR_ADDR", align: "left", width: 200 },
  { type: "text", headerName: "LBL_DESTINATION_CD", field: "TO_LOC_CD", align: "center", width: 80 },
  { type: "text", headerName: "LBL_DESTINATION_NM", field: "TO_LOC_NM", align: "left", width: 120 },
  { type: "text", headerName: "LBL_DESTINATION_ADDRESS", field: "TO_ADDR", align: "left", width: 200 },
  { type: "text", headerName: "LBL_SOLD_TO_CD", field: "SOLD_TO_CD", align: "left", width: 100 },
  { type: "text", headerName: "LBL_SOLD_TO_NM", field: "SOLD_TO_NM", align: "left", width: 120 },
  { type: "text", headerName: "LBL_RMRK", field: "SHPM_RSN_DESC", align: "left", width: 200 },
  { type: "text", headerName: "LBL_DIVISION_CODE", field: "DIV_CD", align: "center", width: 150 },
  { type: "text", headerName: "LBL_DIVISION_NAME", field: "DIV_NM", align: "left", width: 150 },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_CODE", field: "LGST_GRP_CD", align: "center", width: 150 },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_NAME", field: "LGST_GRP_NM", align: "left", width: 150 },
];

// ── sub01: 비용계산식 ─────────────────────────────────────────────
export const SUB01_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "주문ID", field: "ORD_NO", width: 150, hide: true, locked: true, noLang: true },
  { type: "text", headerName: "LBL_SHIPMENT_NUMBER", field: "SHPM_NO", align: "center", width: 150, locked: true },
  { type: "combo", headerName: "LBL_SHIPMENT_OP_STATUS", field: "SHPM_OP_STS", statusStyle: "SHPM_OP_STS", codeKey: "shpmOpStsList", align: "center", width: 150, locked: true },
  {
    type: "combo",
    headerName: "LBL_DISPATCH_OPERATIONAL_STATUS",
    field: "DSPCH_OP_STS",
    codeKey: "dspchStatusList",
    statusStyle: "DSPCH_OP_STS",
    align: "center",
    width: 150,
  },
  { type: "text", headerName: "LBL_CARRIER_CODE", field: "CARR_CD", align: "center", width: 150 },
  { type: "text", headerName: "LBL_CARRIER_NAME", field: "CARR_NM", width: 150 },
  { type: "text", headerName: "LBL_VEHICLE_TYPE_CODE", field: "VEH_TP_CD", align: "center", width: 150 },
  { type: "text", headerName: "LBL_VEHICLE_TYPE_NAME", field: "VEH_TP_NM", width: 150 },
  { type: "text", headerName: "LBL_VEHICLE_CODE", field: "VEH_ID", align: "center", width: 150 },
  { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO", width: 150 },
  { type: "text", headerName: "LBL_DRIVER_NAME", field: "DRVR_NM", width: 150 },
  { type: "combo", headerName: "LBL_AP_CLASSIFICATION", field: "AP_PROC_TP", codeKey: "payTypeList", align: "center", width: 150 },
];

// ── sub02: 비용조건 ───────────────────────────────────────────────
export const SUB02_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "combo", headerName: "LBL_AP_CLASSIFICATION", field: "AP_TP", codeKey: "payTypeList", align: "center", width: 150 },
  { type: "text", headerName: "LBL_AP_ID", field: "AP_ID", align: "center", width: 150 },
  { type: "text", headerName: "LBL_CARRIER_CODE", field: "CARR_CD", align: "center", width: 150 },
  { type: "text", headerName: "LBL_CARRIER_NAME", field: "CARR_NM", width: 150 },
  { type: "combo", headerName: "LBL_FINANCIAL_STATUS", field: "FI_STS", codeKey: "apFiStsList", align: "center", width: 150 },
  { type: "numeric", headerName: "LBL_COST", field: "FI_COST", align: "right", width: 140 },
  { type: "text", headerName: "LBL_CURRENCY", field: "CURR_CD", align: "center", width: 150 },
];
