
export const MAIN_COLUMN_DEFS = () => [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_FINANCIAL_STATUS",
    field: "AP_FI_STS",
    codeKey: "apFiSts",
    align: "center",
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
    editable: true, insertable: true,
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
];

// ── 경유처 서브그리드 컬럼 (센차: TenderReceiveDispatchSub01 columns) ──
export const STOP_COLUMN_DEFS = () => [
  { headerName: "No" },
  { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO" },
  { type: "numeric", headerName: "LBL_STOP_SEQUENCE", field: "STOP_SEQ" },
  { type: "text", headerName: "LBL_LOCATION_CODE", field: "LOC_CD" },
  { type: "text", headerName: "LBL_LOCATION_NAME", field: "LOC_NM" },
  { type: "combo", headerName: "LBL_PICKDROP_DIV", field: "STOP_TP" },
  { type: "datetime", headerName: "LBL_ATA_DTTM", field: "ATA_DTTM" },
  { type: "datetime", headerName: "LBL_ATD_DTTM", field: "ATD_DTTM" },
  { type: "text", headerName: "LBL_STATE", field: "STT_NM" },
  { type: "text", headerName: "LBL_CITY", field: "CTY_NM" },
  { type: "text", headerName: "LBL_DETAIL_ADDRESS", field: "DTL_ADDR1" },
];

// ── SMS 전송이력 서브그리드 컬럼 (센차: TenderReceiveDispatchSub04 columns) ──
export const SMS_COLUMN_DEFS = () => [
  { headerName: "No" },
  { type: "text", headerName: "LBL_SMS_SEND_ID", field: "SMS_SEND_ID" },
  { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO" },
  { type: "text", headerName: "LBL_SEND_NO", field: "SEND_NO" },
];

// ── 운송비내역 서브그리드 컬럼 (센차: TenderReceiveDispatchCarrRate columns) ──
// setRowData: 삭제 체크박스 클릭 시 행 제거용 (센차에는 없던 UX, React 방식 추가)
export const AP_SETL_COLUMN_DEFS = () => [
  { headerName: "No" },
  { type: "text", headerName: "배차번호", field: "DSPCH_NO", hide: true },
  { type: "text", headerName: "항목코드", field: "CHG_CD", hide: true },
  { type: "text", headerName: "LBL_AP_CTG", field: "CHG_NM" },
  { type: "numeric", headerName: "LBL_REG_RATE", field: "RATE" },
  { type: "numeric", headerName: "LBL_CONFIRM_COST", field: "CFM_COST" },
  { type: "numeric", headerName: "LBL_CFM_DESC", field: "CFM_COST" },
  { type: "text", headerName: "비고", field: "RMK", hide: true },
];
