// 그리드 컬럼 정의 (서버 PodColectionReportMainGrid/SubGrid01/SubGrid02 기준)
// 읽기전용 리포트 — 편집 컬럼 없음(서버 editDisabled:true). audit 컬럼 없음.

// ── main: 물류운영그룹단위 ────────────────────────────────────────
export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_CODE", field: "LGST_GRP_CD", width: 140 },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_NAME", field: "LGST_GRP_NM", align: "left", flex: 1 },
  { type: "numeric", headerName: "LBL_ISSUED_POD_COUNT", field: "PRINT_CNT", width: 120 },
  { type: "numeric", headerName: "LBL_COLLECTED_POD_COUNT", field: "COLLECT_CNT", width: 120 },
  { type: "numeric", headerName: "LBL_NON_COLLECTED_POD_COUNT", field: "UN_COLLECT_CNT", width: 120 },
  { type: "numeric", headerName: "LBL_COLLECT_RATIO", field: "COLLECT_PERCNT", width: 100 },
  // 하위 그리드 조회 파라미터 (서버 hidden 컬럼)
  { type: "text", headerName: "DLVRY_DT_FR", field: "DLVRY_DT_FR", noLang: true, hide: true },
  { type: "text", headerName: "DLVRY_DT_TO", field: "DLVRY_DT_TO", noLang: true, hide: true },
  { type: "text", headerName: "CARR_CD", field: "CARR_CD", noLang: true, hide: true },
];

// ── sub01: 일자별 ─────────────────────────────────────────────────
export const SUB01_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_REQUESTED_DELIVERY_DATE", field: "DLVRY_DT", align: "center", width: 110 },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_CODE", field: "LGST_GRP_CD", width: 140 },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_NAME", field: "LGST_GRP_NM", align: "left", flex: 1 },
  { type: "numeric", headerName: "LBL_ISSUED_POD_COUNT", field: "PRINT_CNT", width: 120 },
  { type: "numeric", headerName: "LBL_COLLECTED_POD_COUNT", field: "COLLECT_CNT", width: 120 },
  { type: "numeric", headerName: "LBL_COLLECT_RATIO", field: "COLLECT_PERCNT", width: 100 },
  // 하위 그리드 조회 파라미터 (서버 hidden 컬럼)
  { type: "text", headerName: "CARR_CD", field: "CARR_CD", noLang: true, hide: true },
];

// ── sub02: 인수증 상세 ────────────────────────────────────────────
export const SUB02_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_POD_NO", field: "POD_ID", width: 100 },
  { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO", width: 100 },
  { type: "combo", headerName: "LBL_OPERATIONAL_STATUS", field: "SHPM_OP_STS", codeKey: "shpmOpStsList", align: "center", width: 120 },
  { type: "combo", headerName: "LBL_POD_OP_STS", field: "POD_OP_STS", codeKey: "podOpStatus", align: "center", width: 100 },
  { type: "text", headerName: "LBL_VEHICLE_CODE", field: "VEH_ID", align: "center", width: 80 },
  { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO", align: "center", width: 100 },
  { type: "text", headerName: "LBL_CARRIER_CODE", field: "CARR_CD", width: 120 },
  { type: "text", headerName: "LBL_CARRIER_NAME", field: "CARR_NM", width: 120 },
];
