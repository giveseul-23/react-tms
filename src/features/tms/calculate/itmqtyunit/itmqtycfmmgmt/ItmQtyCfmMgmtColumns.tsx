// 그리드 컬럼 정의 (서버 ItmQtyCfmMgmtMainGrid/Sub01/Sub02/Sub03 기준)
// audit 컬럼(등록자/등록일시/수정자/수정일시)·EDIT_STS 는 DataGrid 가 자동 추가(model.bind).

// 확정수치 셀 색상 — 계획수치 > 확정수치 면 빨강, 아니면 초록 (서버 onRenderer 대응)
const cfmQtyCellStyle = (p: any) => {
  const pln = Number(p?.data?.PLN_QTY);
  const val = Number(p?.value);
  if (pln > val) {
    return { backgroundColor: "#FBE4E4", color: "#D9534F" };
  }
  return { backgroundColor: "#E4F7E4", color: "#3C9A3C" };
};

// ── 메인: 물동량 (확정수치/메모만 편집) ────────────────────────────
export const MAIN_COLUMN_DEFS = [
  { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO", align: "center", width: 120 },
  { type: "numeric", headerName: "LBL_ITM_QTY_LINE_ID", field: "ITEMQTY_LINE_ID", width: 90 },
  { type: "combo", headerName: "LBL_ITM_QTY_OP_STS", field: "ITEMQTY_OP_STS", codeKey: "itmqtyOpSts", align: "center", width: 100 },
  { type: "text", headerName: "LBL_DLVRY_DATE", field: "DLVRY_DT", align: "center", width: 90 },
  { type: "text", headerName: "LBL_INBND_DT", field: "INBND_DT", align: "center", width: 90 },
  { type: "text", headerName: "LBL_OTBND_DT", field: "OTBND_DT", align: "center", width: 90 },
  { type: "text", headerName: "LBL_DEPARTURE_CODE", field: "FRM_LOC_CD", align: "center", width: 90 },
  { type: "text", headerName: "LBL_DEPARTURE_NAME", field: "FRM_LOC_NM", align: "left", width: 100 },
  { type: "text", headerName: "LBL_DESTINATION_CD", field: "TO_LOC_CD", align: "center", width: 90 },
  { type: "text", headerName: "LBL_DESTINATION_NM", field: "TO_LOC_NM", align: "left", width: 100 },
  { type: "text", headerName: "LBL_TARIFF_UOM_CD", field: "ITEM_CD", align: "left", width: 90 },
  { type: "text", headerName: "LBL_TARIFF_UOM_NM", field: "ITEM_NM", align: "left", width: 120 },
  { type: "numeric", headerName: "LBL_PLAN_VALUE", field: "PLN_QTY", width: 100, validators: { min: 0 }, summable: true },
  {
    type: "numeric",
    headerName: "LBL_CONFIRMED_VALUE",
    field: "CFM_QTY",
    width: 100,
    editable: true,
    validators: { min: 0 },
    summable: true,
    cellStyle: cfmQtyCellStyle,
  },
  { type: "text", headerName: "LBL_ITM_QTY_CHG_MEMO", field: "MEMO_DESC", align: "left", width: 200, editable: true },
  { type: "numeric", headerName: "LBL_ITM_TOTAL_COST", field: "ITM_TOTAL_COST", width: 90, summable: true },
  { type: "text", headerName: "LBL_ITM_UOM", field: "ITEM_UOM", align: "left", width: 80, hide: true },
  { type: "text", headerName: "LBL_PAY_CARRIER_CODE", field: "PAY_CARR_CD", align: "center", width: 120 },
  { type: "text", headerName: "LBL_PAY_CARRIER_NAME", field: "PAY_CARR_NM", align: "left", width: 120 },
  { type: "text", headerName: "LBL_DIVISION_CODE", field: "DIV_CD", align: "center", width: 90 },
  { type: "text", headerName: "LBL_DIVISION_NAME", field: "DIV_NM", align: "left", width: 100 },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_CODE", field: "LGST_GRP_CD", align: "center", width: 100 },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_NAME", field: "LGST_GRP_NM", align: "left", width: 100 },
  { type: "text", headerName: "LBL_AP_DOC_ID", field: "AP_ID", align: "center", width: 90 },
  { type: "text", headerName: "LBL_FROM_ZN_CD", field: "FRM_ZN_CD", align: "center", width: 90 },
  { type: "text", headerName: "LBL_TO_ZN_CD", field: "TO_ZN_CD", align: "center", width: 90 },
  { type: "text", headerName: "LBL_LANE_ID", field: "LANE_ID", align: "center", width: 90 },
  { type: "combo", headerName: "LBL_LANE_STS", field: "LANE_STS", codeKey: "laneSts", align: "center", width: 100 },
];

// ── sub01: 배차할당 운송 (읽기전용 + 합계행) ───────────────────────
export const SUB01_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_DEPARTURE_NAME", field: "FRM_LOC_NM", align: "left", width: 160 },
  { type: "text", headerName: "LBL_DESTINATION_NAME", field: "TO_LOC_NM", align: "left", width: 150 },
  { type: "text", headerName: "LBL_TO_DETAIL_ADDRESS_1", field: "TO_DTL_ADDR1", align: "left", width: 250 },
  { type: "text", headerName: "LBL_DESTINATION_ZIP_CODE", field: "TO_ZIP_CD", align: "center", width: 120 },
  { type: "text", headerName: "LBL_ITEM_UOM", field: "QTY", align: "left", width: 120 },
  { type: "numeric", headerName: "LBL_VOL", field: "PLN_VOL", align: "right", width: 90, summable: true },
  { type: "numeric", headerName: "LBL_WGT", field: "PLN_WGT", align: "right", width: 90, summable: true },
  { type: "numeric", headerName: "LBL_FLEX_QTY1", field: "PLN_FLEX_QTY1", align: "right", width: 120, summable: true },
  { type: "numeric", headerName: "LBL_FLEX_QTY2", field: "PLN_FLEX_QTY2", align: "right", width: 120, summable: true },
  { type: "numeric", headerName: "LBL_FLEX_QTY3", field: "PLN_FLEX_QTY3", align: "right", width: 120, summable: true },
  { type: "numeric", headerName: "LBL_FLEX_QTY4", field: "PLN_FLEX_QTY4", align: "right", width: 120, summable: true },
  { type: "numeric", headerName: "LBL_FLEX_QTY5", field: "PLN_FLEX_QTY5", align: "right", width: 120, summable: true },
  { type: "text", headerName: "LBL_CUSTOMER_ORDER_NO", field: "CUST_ORD_NO", align: "center", width: 120 },
  { type: "text", headerName: "LBL_ORDER_NO", field: "ORD_NO", align: "center", width: 120 },
  { type: "text", headerName: "LBL_SHIPMENT_NUMBER", field: "SHPM_NO", align: "center", width: 160 },
  { type: "text", headerName: "LBL_DESTINATION_CODE", field: "TO_LOC_CD", align: "center", width: 120 },
  { type: "text", headerName: "LBL_DEPARTURE_CODE", field: "FRM_LOC_CD", align: "center", width: 120 },
  { type: "text", headerName: "LBL_FRM_DETAIL_ADDRESS_1", field: "FRM_DTL_ADDR1", align: "left", width: 160 },
  { type: "text", headerName: "LBL_DEPARTURE_ZIP_CODE", field: "FRM_ZIP_CD", align: "center", width: 120 },
  { type: "text", headerName: "LBL_SHPM_RMRK", field: "SHPM_RSN_DESC", align: "left", width: 160 },
  { type: "text", headerName: "LBL_SOLD_TO_CD", field: "SOLD_TO_CD", align: "left", width: 120 },
  { type: "text", headerName: "LBL_SOLD_TO_NM", field: "SOLD_TO_NM", align: "left", width: 150 },
];

// ── sub02: 운송상세 (품목비고만 편집 + 합계행) ──────────────────────
export const SUB02_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_ORD_ITM_LINE_NO", field: "ORD_LINE_NO", align: "left", width: 100 },
  { type: "text", headerName: "LBL_ITEM_CD", field: "CUST_ITEM_CD", align: "center", width: 100 },
  { type: "text", headerName: "LBL_ITEM_NM", field: "CUST_ITEM_NM", align: "left", width: 120 },
  { type: "combo", headerName: "LBL_QTY_UOM", field: "PLN_QTY_UOM", codeKey: "itmUomList", align: "center", width: 100 },
  { type: "numeric", headerName: "LBL_PLANNED_QTY", field: "PLN_QTY", align: "right", width: 90, summable: true },
  { type: "numeric", headerName: "LBL_PLN_VOL", field: "PLN_VOL", align: "right", width: 90, summable: true, decimalPlaces: 4 },
  { type: "numeric", headerName: "LBL_PLN_WGT", field: "PLN_WGT", align: "right", width: 90, summable: true, decimalPlaces: 4 },
  { type: "numeric", headerName: "LBL_PLANNED_FLEX_QTY1", field: "PLN_FLEX_QTY1", align: "right", width: 80, summable: true, decimalPlaces: 4 },
  { type: "numeric", headerName: "LBL_PLANNED_FLEX_QTY2", field: "PLN_FLEX_QTY2", align: "right", width: 90, summable: true, decimalPlaces: 4 },
  { type: "numeric", headerName: "LBL_PLANNED_FLEX_QTY3", field: "PLN_FLEX_QTY3", align: "right", width: 90, summable: true, decimalPlaces: 4 },
  { type: "numeric", headerName: "LBL_PLANNED_FLEX_QTY4", field: "PLN_FLEX_QTY4", align: "right", width: 90, summable: true, decimalPlaces: 4 },
  { type: "numeric", headerName: "LBL_PLANNED_FLEX_QTY5", field: "PLN_FLEX_QTY5", align: "right", width: 90, summable: true, decimalPlaces: 4 },
  { type: "numeric", headerName: "LBL_CONFIRMED_QTY", field: "CFM_QTY", align: "right", width: 100, summable: true },
  { type: "numeric", headerName: "LBL_CONFIRMED_VOL", field: "CFM_VOL", align: "right", width: 100, summable: true, decimalPlaces: 2 },
  { type: "numeric", headerName: "LBL_CONFIRMED_WGT", field: "CFM_WGT", align: "right", width: 100, summable: true },
  { type: "numeric", headerName: "LBL_CONFIRMED_FLEX_QTY1", field: "CFM_FLEX_QTY1", align: "right", width: 100, summable: true, decimalPlaces: 2 },
  { type: "numeric", headerName: "LBL_CONFIRMED_FLEX_QTY2", field: "CFM_FLEX_QTY2", align: "right", width: 100, summable: true, decimalPlaces: 2 },
  { type: "numeric", headerName: "LBL_CONFIRMED_FLEX_QTY3", field: "CFM_FLEX_QTY3", align: "right", width: 100, summable: true, decimalPlaces: 2 },
  { type: "numeric", headerName: "LBL_CONFIRMED_FLEX_QTY4", field: "CFM_FLEX_QTY4", align: "right", width: 100, summable: true },
  { type: "numeric", headerName: "LBL_CONFIRMED_FLEX_QTY5", field: "CFM_FLEX_QTY5", align: "right", width: 100, summable: true },
  { type: "text", headerName: "LBL_ITEM_REMARK", field: "SHPM_DTL_RSN_DESC", align: "left", width: 120, editable: true },
  { type: "text", headerName: "LBL_FEED_FCD", field: "ITEM_FCD", align: "left", width: 100 },
  { type: "text", headerName: "LBL_TEMPER_ZONE", field: "TEMP_TCD", align: "left", width: 80 },
];

// ── sub03: 물동량 수치변경 이력 (읽기전용 + 합계행) ─────────────────
export const SUB03_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_AP_CD", field: "CHG_CD", align: "center", width: 100 },
  { type: "text", headerName: "LBL_AP_NM", field: "CHG_NM", align: "left", width: 100 },
  { type: "numeric", headerName: "LBL_UNIT_COST", field: "CHG_RATE", align: "right", width: 90, summable: true },
  { type: "numeric", headerName: "LBL_RATE", field: "CHH_TTL_PLN_RATE", align: "right", width: 90, summable: true },
  { type: "numeric", headerName: "LBL_QTY_PER_BOX", field: "QTY_PER_BOX", align: "right", width: 100, summable: true },
  { type: "numeric", headerName: "LBL_CONFIRMED_QTY", field: "CFM_QTY", align: "right", width: 90, summable: true },
  { type: "numeric", headerName: "LBL_CAL_BOX_QTY", field: "CAL_BOX_QTY", align: "right", width: 90, summable: true },
  { type: "numeric", headerName: "LBL_CAL_REMAIN_QTY", field: "CAL_REMAIN_QTY", align: "right", width: 90, summable: true },
  { type: "numeric", headerName: "LBL_CAL_WGT", field: "CAL_WGT", align: "right", width: 90, summable: true },
];
