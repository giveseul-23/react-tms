// 그리드 컬럼 정의 (서버 HipassFareManagementMain / Sub01 기준)
// 전 컬럼 editDisabled+insertDisabled → 읽기전용. audit 컬럼은 DataGrid 가 자동 추가(model.bind).

// ── 메인: 하이패스매입정산문서 단위 (읽기전용 + 합계행) ──────────────
export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_DIV", field: "DIV_CD", hide: true },
  { type: "text", headerName: "LBL_LGST_GRP", field: "LGST_GRP_CD", hide: true },
  { type: "text", headerName: "LBL_HIPASS_AP_ID", field: "HIPASS_AP_ID", align: "center", width: 150 },
  { type: "text", headerName: "LBL_PAY_CARR_CD", field: "PAY_CARR_CD", hide: true },
  { type: "combo", headerName: "LBL_OP_STATUS", field: "HIPASS_FI_STS", codeKey: "fiStsList", align: "center" },
  { type: "numeric", headerName: "LBL_EXCL_LINE_CNT", field: "EXCL_LINE_CNT", align: "right", width: 80, summable: true },
  { type: "numeric", headerName: "LBL_REGI_LINE_CNT", field: "UPLD_LINE_CNT", align: "right", width: 80, summable: true },
  { type: "numeric", headerName: "LBL_TRANS_RATE_TOT", field: "TTL_TRNSCTN_RATE", align: "right", width: 100, summable: true },
  { type: "numeric", headerName: "LBL_APPROV_RATE_TOT", field: "TTL_APRVL_RATE", align: "right", width: 100, summable: true },
];

// ── sub01: 차량단위 상세 (읽기전용 + 합계행) ─────────────────────────
export const SUB01_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_VEH_ID", field: "VEH_ID", hide: true },
  { type: "text", headerName: "LBL_VEHICLE_NUMBER", field: "VEH_NO", align: "center", width: 90 },
  { type: "text", headerName: "LBL_DRIVER_NAME", field: "DRVR_NM", align: "center", width: 80 },
  { type: "text", headerName: "LBL_VEHICLE_TYPE", field: "VEH_TP_NM", align: "center", width: 90 },
  { type: "text", headerName: "LBL_HIPASS_CARDNO", field: "HIPASS_CARD_NO", align: "center", width: 150 },
  { type: "combo", headerName: "LBL_DIV", field: "HIGHWAY_OP_TCD", codeKey: "highWayTcd", align: "center", width: 50 },
  { type: "numeric", headerName: "LBL_TRANS_RATE", field: "TRNSCTN_RATE", align: "right", width: 100, summable: true },
  { type: "numeric", headerName: "LBL_APPROV_RATE", field: "APRVL_RATE", align: "right", width: 100, summable: true },
];
