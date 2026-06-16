// 그리드 컬럼 정의 (서버 OnTimeDeliveryResultMainGrid 기준)
// 전 컬럼 읽기전용 조회 화면(editDisabled:true). audit 컬럼은 서버에 없으므로 View 에서 audit={false}.

// 납기준수여부(20=미준수) 행 강조 — 서버 onRenderer 대응 (align 대신 cellStyle 함수에 정렬 포함)
const reqDlvryCellStyle = (p: any) =>
  p?.data?.REQ_DLVRY_YN === "20"
    ? { textAlign: "center", backgroundColor: "#FCE4D6", color: "#000000" }
    : { textAlign: "center" };

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "date", headerName: "LBL_REQUESTED_DELIVERY_DATE", field: "DLVRY_DT", align: "center", width: 120 },
  { type: "text", headerName: "LBL_CARRIER_NAME", field: "CARR_NM", align: "left", width: 140 },
  { type: "text", headerName: "LBL_BATCH_NO", field: "BATCH_NO", align: "center", width: 60, hide: true },
  { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO", align: "center", width: 150 },
  { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO", align: "center", width: 80 },
  { type: "text", headerName: "LBL_LOCATION_NAME", field: "LOC_NM", width: 150 },
  { type: "datetime", headerName: "LBL_ATA_DTTM", field: "ATA_DTTM", align: "center", width: 200 },
  {
    type: "combo",
    headerName: "LBL_OTD_COMPLIANCE",
    field: "REQ_DLVRY_YN",
    codeKey: "dlvryYnList",
    headerClass: "ag-header-center",
    width: 180,
    cellStyle: reqDlvryCellStyle,
  },
  { type: "datetime", headerName: "LBL_ETA_DTTM", field: "ETA_DTTM", align: "center", width: 180 },
  { type: "datetime", headerName: "LBL_ETD_DTTM", field: "ETD_DTTM", align: "center", width: 180 },
  { type: "numeric", headerName: "LBL_LATITUDE", field: "LAT", width: 100 },
  { type: "numeric", headerName: "LBL_LONGITUDE", field: "LON", width: 100 },
  { type: "text", headerName: "LBL_DIVISION_CODE", field: "DIV_CD", width: 180 },
  { type: "text", headerName: "LBL_DIVISION_NAME", field: "DIV_NM", width: 300 },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_CODE", field: "LGST_GRP_CD", width: 180 },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_NAME", field: "LGST_GRP_NM", width: 300 },
  { type: "text", headerName: "LBL_VEHICLE_CODE", field: "VEH_ID", align: "center", width: 130 },
  { type: "text", headerName: "LBL_EVENT_CODE", field: "STOP_EVNT_CD", width: 150 },
  { type: "text", headerName: "LBL_EVENT_NAME", field: "STOP_EVNT_NM", width: 200 },
  { type: "text", headerName: "LBL_EVENT_RMK", field: "STOP_EVNT_RMK", width: 400 },
];
