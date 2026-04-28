import { standardAudit } from "@/app/components/grid/commonColumns";

export const MAIN_COLUMN_DEFS = (setGridData?: (updater: any) => void) => [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_FINANCIAL_STATUS",
    field: "AP_FI_STS",
    codeKey: "apFiSts",
  },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP", field: "LGST_GRP_CD" },
  {
    type: "date",
    headerName: "LBL_REQUESTED_DELIVERY_DATE",
    field: "DLVRY_DT",
  },
  { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO" },
  {
    type: "text",
    headerName: "LBL_DISPATCH_OPERATIONAL_STATUS",
    field: "DSPCH_OP_STS",
    codeKey: "dspchOpSts",
  },
  { type: "text", headerName: "LBL_CARRIER_NAME", field: "CARR_NM" },
  { type: "text", headerName: "LBL_VEHICLE_TYPE_NAME", field: "VEH_TP_NM" },
  { type: "text", headerName: "입차순서", field: "ETRNC_SEQ" },
  { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO" },
  { type: "text", headerName: "LBL_DRIVER_NAME", field: "DRVR_NM" },
  { type: "text", headerName: "LBL_DEPARTURE_NAME", field: "FRM_LOC_NM" },
  { headerName: "LBL_TRCK_NO", field: "TRCK_NO", type: "numeric" },
  {
    type: "date",
    headerName: "LBL_SEND_SMS_DTTM",
    field: "SMS_APP_INST_DTTM",
  },
  { type: "text", headerName: "LBL_SEND_NO", field: "SEND_NO" },
  { type: "text", headerName: "LBL_MEMO", field: "MEMO" },
  { headerName: "LBL_STOP_CNT", field: "STOP_CNT", type: "numeric" },
  {
    type: "text",
    headerName: "LBL_CARR_RATE_BKNG_ALLWD_YN",
    field: "CARR_BOOKING_YN",
  },
  {
    headerName: "LBL_REG_RATE",
    field: "RATE",
    type: "numeric",
    editable: true,
    valueSetter: (params: any) => {
      params.data.RATE = params.newValue;
      return true;
    },
  },
  { headerName: "LBL_CONFIRM_COST", field: "CFM_COST", type: "numeric" },
  { type: "text", headerName: "LBL_DIVISION", field: "DIV_CD" },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP", field: "LGST_GRP_CD" },
  { type: "text", headerName: "LBL_DEPARTURE_CODE", field: "FRM_LOC_CD" },
  { type: "text", headerName: "LBL_TRIP_NO", field: "TRIP_ID" },
  { headerName: "LBL_TRIP_SEQ", field: "TRIP_SEQ", type: "numeric" },
  { type: "text", headerName: "LBL_VEHICLE_CODE", field: "VEH_ID" },
  { type: "text", headerName: "LBL_DRIVER_CODE", field: "DRVR_ID" },
  { headerName: "LBL_BATCH", field: "BATCH_NO", type: "numeric" },
  {
    type: "text",
    headerName: "LBL_REQUEST_DATETIME",
    field: "REQ_ETRNC_DTTM",
  },
  {
    type: "text",
    headerName: "LBL_EXPECTED_DATETIME",
    field: "EXPCT_ETRNC_DTTM",
  },
  {
    type: "text",
    headerName: "LBL_ETRNC_RSN_DESC",
    field: "DLYD_ETRNC_RSN_DESC",
  },
  { type: "text", headerName: "LBL_CHK_TON_TYPE", field: "CARR_CFM_VEH_TCD" },
  ...standardAudit(setGridData),
];

// ── 경유처 서브그리드 컬럼 (센차: TenderReceiveDispatchSub01 columns) ──
export const STOP_COLUMN_DEFS = (setGridData?: (updater: any) => void) => [
  { headerName: "No" },
  { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO" },
  { type: "text", headerName: "LBL_STOP_SEQUENCE", field: "STOP_SEQ" },
  { type: "text", headerName: "LBL_LOCATION_CODE", field: "LOC_CD" },
  { type: "text", headerName: "LBL_LOCATION_NAME", field: "LOC_NM" },
  { type: "text", headerName: "LBL_PICKDROP_DIV", field: "STOP_TP" },
  { type: "text", headerName: "LBL_STATE", field: "STT_NM" },
  { type: "text", headerName: "LBL_CITY", field: "CTY_NM" },
  { type: "text", headerName: "LBL_DETAIL_ADDRESS", field: "DTL_ADDR1" },
  { type: "text", headerName: "LBL_DETAIL_ADDRESS2", field: "DTL_ADDR2" },
  { type: "numeric", headerName: "위도", field: "LAT" },
  { type: "numeric", headerName: "경도", field: "LON" },
  { type: "numeric", headerName: "상차CBM", field: "LDNG_VOL" },
  { type: "numeric", headerName: "상차중량", field: "LDNG_WGT" },
  { type: "numeric", headerName: "상차FQ1", field: "LDNG_FLEX_QTY1" },
  { type: "numeric", headerName: "상차FQ2", field: "LDNG_FLEX_QTY2" },
  { type: "numeric", headerName: "상차FQ3", field: "LDNG_FLEX_QTY3" },
  { type: "numeric", headerName: "상차FQ4", field: "LDNG_FLEX_QTY4" },
  { type: "numeric", headerName: "상차FQ5", field: "LDNG_FLEX_QTY5" },
  { type: "numeric", headerName: "하차CBM", field: "UNLDNG_VOL" },
  { type: "numeric", headerName: "하차중량", field: "UNLDNG_WGT" },
  { type: "numeric", headerName: "하차FQ1", field: "UNLDNG_FLEX_QTY1" },
  { type: "numeric", headerName: "하차FQ2", field: "UNLDNG_FLEX_QTY2" },
  { type: "numeric", headerName: "하차FQ3", field: "UNLDNG_FLEX_QTY3" },
  { type: "numeric", headerName: "하차FQ4", field: "UNLDNG_FLEX_QTY4" },
  { type: "numeric", headerName: "하차FQ5", field: "UNLDNG_FLEX_QTY5" },
];

// ── SMS 전송이력 서브그리드 컬럼 (센차: TenderReceiveDispatchSub04 columns) ──
export const SMS_COLUMN_DEFS = (setGridData?: (updater: any) => void) => [
  { headerName: "No" },
  { type: "text", headerName: "LBL_ORDER_NO", field: "ORD_NO" },
  { type: "text", headerName: "LBL_CUSTOMER_ORDER_NO", field: "CUST_ORD_NO" },
  { type: "text", headerName: "LBL_DESTINATION_CODE", field: "TO_LOC_CD" },
  { type: "text", headerName: "LBL_DESTINATION_NAME", field: "TO_LOC_NM" },
  { type: "text", headerName: "LBL_DESTINATION_ZIP_CODE", field: "TO_ZIP_CD" },
  { type: "numeric", headerName: "LBL_TO_LAT", field: "TO_LAT" },
  { type: "numeric", headerName: "LBL_TO_LON", field: "TO_LON" },
  { type: "text", headerName: "주문타입", field: "ORD_TP" },
  { type: "text", headerName: "주문번호", field: "SHPM_NO" },
  { type: "text", headerName: "콘솔", field: "MIT_CLSS_CD" },
  { type: "text", headerName: "고객사코드", field: "CUST_CD" },
  { type: "text", headerName: "고객사명", field: "CUST_NM" },
  { type: "text", headerName: "LBL_DEPARTURE_CODE", field: "FRM_LOC_ID" },
  { type: "text", headerName: "LBL_DEPARTURE_CODE", field: "FRM_LOC_CD" },
  { type: "text", headerName: "LBL_DEPARTURE_NAME", field: "FRM_LOC_NM" },
  {
    type: "text",
    headerName: "LBL_DEPARTURE_COUNTRY_NAME",
    field: "FRM_CNTY_NM",
  },
  { type: "text", headerName: "LBL_FROM_CITY_NM", field: "FRM_CTY_NM" },
  { type: "text", headerName: "LBL_FROM_STATE_NM", field: "FRM_STT_NM" },
  { type: "text", headerName: "LBL_DEPARTURE_ZIP_CODE", field: "FRM_ZIP_CD" },
  { type: "numeric", headerName: "LBL_FROM_LAT", field: "FRM_LAT" },
  { type: "numeric", headerName: "LBL_FROM_LON", field: "FRM_LON" },
];

// ── 운송비내역 서브그리드 컬럼 (센차: TenderReceiveDispatchCarrRate columns) ──
// setRowData: 삭제 체크박스 클릭 시 행 제거용 (센차에는 없던 UX, React 방식 추가)
export const AP_SETL_COLUMN_DEFS = (setGridData?: (updater: any) => void) => [
  { headerName: "No" },
  { type: "text", field: "DSPCH_NO", hide: true },
  { type: "text", headerName: "항목코드", field: "CHG_CD" },
  { type: "text", headerName: "LBL_AP_CTG", field: "CHG_NM" },
  {
    type: "numeric",
    headerName: "LBL_REG_RATE",
    field: "RATE",
    editable: true,
  },
  { type: "numeric", headerName: "LBL_CONFIRM_COST", field: "CFM_COST" },
  { type: "text", headerName: "LBL_CFM_DESC", field: "RMK" },
  ...standardAudit(setGridData),
];
