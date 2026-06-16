// 그리드 컬럼 정의 (서버 UnsettlementDispatchMain 기준)
// KPI 조회 화면 — 전체 읽기전용. audit 컬럼은 OMIT(서버에도 없음).

// 마감그룹SAP전송여부: 'P' → '부분완료' (서버 onRenderer 대응)
const sapSendFormatter = (p: any) => {
  const v = p?.value;
  if (v === "P") return "부분완료";
  return v ?? "";
};

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_DIVISION_CODE", field: "DIV_CD", align: "center", width: 80 },
  { type: "text", headerName: "LBL_DIVISION_NAME", field: "DIV_NM", align: "left", width: 100 },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_CODE", field: "LGST_GRP_CD", align: "center", width: 100 },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_NAME", field: "LGST_GRP_NM", align: "left", width: 120 },
  { type: "datetime", headerName: "LBL_DLVRY_DATE", field: "DLVRY_DT", align: "center", width: 80 },
  { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO", align: "center", width: 100 },
  { type: "combo", headerName: "LBL_AP_CLASSIFICATION", field: "AP_PROC_TP", codeKey: "apProcTpList", align: "center", width: 80 },
  { type: "text", headerName: "LBL_VEHICLE_NUMBER", field: "VEH_NO", align: "center", width: 90 },
  { type: "numeric", headerName: "LBL_TRIP_COUNT", field: "RTN_NO", align: "center", width: 80 },
  { type: "text", headerName: "LBL_VEHICLE_TYPE", field: "VEH_TP_NM", align: "center", width: 100 },
  { type: "text", headerName: "LBL_DRIVER_NAME", field: "DRVR_NM", align: "left", width: 80 },
  { type: "text", headerName: "LBL_LANE", field: "LOC_LANE", align: "left", width: 200 },
  { type: "combo", headerName: "LBL_DISPATCH_OPERATIONAL_STATUS", field: "DSPCH_OP_STS", codeKey: "dspchOpStsList", align: "center", width: 90 },
  { type: "text", headerName: "LBL_PAY_CARRIER_CODE", field: "PAY_CARR_CD", align: "center", width: 150 },
  { type: "text", headerName: "LBL_PAY_CARRIER_NAME", field: "PAY_CARR_NM", align: "left", width: 200 },
  { type: "text", headerName: "LBL_AP_ID", field: "AP_ID", align: "center", width: 140 },
  { type: "text", headerName: "LBL_FI_SETL_GRP_ID", field: "AP_SETL_GRP_ID", align: "center", width: 140 },
  { type: "text", headerName: "LBL_SETL_DOC_CREATE_YN", field: "SETL_DOC_CREATE_YN", align: "center", width: 150 },
  {
    type: "text",
    headerName: "LBL_SETL_GROUP_SAP_SEND_YN",
    field: "SETL_GROUP_SAP_SEND_YN",
    align: "center",
    width: 150,
    valueFormatter: sapSendFormatter,
  },
];
