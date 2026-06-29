const carrierBookingCellStyle = (p: any): Record<string, string> => {
  const base = { textAlign: "center" as const };
  if (p?.data?.CARR_BOOKING_YN === "N") {
    return { ...base, backgroundColor: "red", color: "#FFFF00", fontWeight: "bold" };
  }
  return base;
};

const tripIdCellStyle = (p: any): Record<string, string> => {
  const base = { textAlign: "center" as const };
  if (p?.data?.TRIP_ID != null && p?.data?.TRIP_ID !== "") {
    return { ...base, color: "#282c34", backgroundColor: "#99CCFF" };
  }
  return base;
};

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "date",
    headerName: "LBL_REQUESTED_DELIVERY_DATE",
    field: "DLVRY_DT",
  },
  { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO" },
  {
    type: "combo",
    headerName: "LBL_DISPATCH_OPERATIONAL_STATUS",
    field: "DSPCH_OP_STS",
    codeKey: "dspchOpSts",
    statusStyle: "DSPCH_OP_STS",
  },
  {
    type: "text",
    headerName: "LBL_CARRIER_NAME",
    field: "CARR_NM",
  },
  {
    type: "text",
    headerName: "LBL_VEHICLE_TYPE_NAME",
    field: "VEH_TP_NM",
  },
  { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO" },
  {
    type: "text",
    headerName: "LBL_DRIVER_NAME",
    field: "DRVR_NM",
  },
  {
    type: "text",
    headerName: "LBL_DEPARTURE_NAME",
    field: "FRM_LOC_NM",
  },
  {
    headerName: "LBL_TRCK_NO",
    field: "TRCK_NO",
    type: "text",
    editable: true,
    insertable: false,
    validators: { max: 30 },
  },
  { type: "datetime", headerName: "LBL_SEND_SMS_DTTM", field: "SMS_APP_INST_DTTM", editable: false },
  { type: "text", headerName: "LBL_SEND_NO", field: "SEND_NO" },
  {
    type: "text",
    headerName: "LBL_MEMO",
    field: "MEMO",
    maxWidth: 100,
  },
  {
    headerName: "LBL_STOP_CNT",
    field: "STOP_CNT",
    type: "numeric",
  },
  {
    type: "text",
    headerName: "LBL_CARR_RATE_BKNG_ALLWD_YN",
    field: "CARR_BOOKING_YN",
    cellStyle: carrierBookingCellStyle,
  },
  {
    headerName: "LBL_REG_RATE",
    field: "RATE",
    type: "numeric",
  },
  {
    headerName: "LBL_CONFIRM_COST",
    field: "CFM_COST",
    type: "numeric",
  },
  { type: "text", headerName: "LBL_DIVISION", field: "DIV_CD" },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_CODE", field: "LGST_GRP_CD" },
  { type: "text", headerName: "LBL_DEPARTURE_CODE", field: "FRM_LOC_CD" },
  {
    type: "text",
    headerName: "LBL_TRIP_NO",
    field: "TRIP_ID",
    cellStyle: tripIdCellStyle,
  },
  { headerName: "LBL_TRIP_SEQ", field: "TRIP_SEQ", type: "numeric" },
  { field: "DROP_LOC_NM", hide: true },
  { field: "BL_NO", hide: true },
  { field: "DSPCH_TP", hide: true },
  { type: "text", headerName: "LBL_VEHICLE_CODE", field: "VEH_ID" },
  { field: "VEH_TP_CD", hide: true },
  { type: "text", headerName: "LBL_DRIVER_CODE", field: "DRVR_ID" },
  { headerName: "LBL_BATCH", field: "BATCH_NO", type: "numeric" },
  {
    type: "datetime",
    headerName: "LBL_REQUEST_DATETIME",
    field: "REQ_ETRNC_DTTM",
  },
  {
    type: "datetime",
    headerName: "LBL_EXPECTED_DATETIME",
    field: "EXPCT_ETRNC_DTTM",
  },
  { type: "text", headerName: "LBL_ETRNC_RSN_DESC", field: "DLYD_ETRNC_RSN_DESC" },
  { type: "combo", headerName: "LBL_CHK_TON_TYPE", field: "CARR_CFM_VEH_TCD", codeKey: "carrCfmVehTcd" },
  { field: "PLN_ID", hide: true },
  { field: "CARR_CD", hide: true },
  { field: "AP_FI_STS", hide: true },
  { field: "AP_PROC_TP", hide: true },
  { field: "TNDR_REQ_ID", hide: true },
  { field: "TNDR_REQ_USR_ID", hide: true },
  { field: "TNDR_REQ_DTTM", hide: true },
  { field: "ASST_ID", hide: true },
  { field: "ASST_NM", hide: true },
];

export const STOP_COLUMN_DEFS = [
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

export const SMS_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_SMS_SEND_ID", field: "SMS_SEND_ID" },
  { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO" },
  { type: "text", headerName: "LBL_SEND_NO", field: "SEND_NO" },
];

export const AP_SETL_COLUMN_DEFS = [
  { headerName: "No" },
  { field: "DSPCH_NO", hide: true },
  { field: "CHG_CD", hide: true },
  { type: "text", headerName: "LBL_AP_CTG", field: "CHG_NM" },
  {
    type: "numeric",
    headerName: "LBL_REG_RATE",
    field: "RATE",
    insertable: true,
    editable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_CONFIRM_COST",
    field: "CFM_COST",
    insertable: true,
    editable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_CFM_DESC",
    field: "CFM_DESC",
    insertable: true,
    editable: true,
  },
  { field: "RMK", hide: true },
];

// 운송비 엑셀 양식 — 센차 TenderReceiveDispatchCarrRateExcel + 동적 요율항목
export const CARRIER_RATE_EXCEL_HEAD = [
  { headerName: "No" },
  { type: "date", headerName: "LBL_REQUESTED_DELIVERY_DATE", field: "DLVRY_DT" },
  { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO" },
  { type: "text", headerName: "LBL_LDNG_SITE", field: "FRM_LOC_NM" },
  { type: "text", headerName: "LBL_UNLDNG_SITE", field: "TO_LOC_NM" },
  { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO" },
  { type: "text", headerName: "LBL_DRIVER_NAME", field: "DRVR_NM" },
  { type: "text", headerName: "LBL_VEHICLE_TYPE_NAME", field: "VEH_TP_NM" },
];

type ChgMeta = { CHG_CD: string; EXCEL_DSPL_COL?: string; CHG_NM?: string };

export function buildCarrierRateExcelColumns(chgList: ChgMeta[]) {
  const body = chgList.map((c) => ({
    type: "numeric",
    noLang: true,
    headerName: c.EXCEL_DSPL_COL ?? c.CHG_NM ?? c.CHG_CD,
    field: c.CHG_CD,
  }));
  return [...CARRIER_RATE_EXCEL_HEAD, ...body];
}
