// 그리드 컬럼 정의 (서버 OilPriceByGasStationMain / Sub01 기준)
// audit 컬럼(등록자/등록일시/수정자/수정일시)은 DataGrid 가 자동 추가(model.bind).

// 평균유가 소수 2자리 표기 (서버 sub01 onRenderer: value.toFixed(2))
const priceFormatter = (p: any) => {
  const n = Number(String(p?.value ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n.toFixed(2) : "";
};

// ── 메인: 주유소(오피넷) ──────────────────────────────────────────
// OPINET_GSSTTN_CD/NM·주소·연락처·상표는 읽기전용, 사용여부(USE_YN)만 수정 가능.
export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_OPINET_GSSTTN_CD", field: "OPINET_GSSTTN_CD", align: "center", width: 100 },
  { type: "text", headerName: "LBL_OPINET_GSSTTN_NM", field: "OPINET_GSSTTN_NM", align: "left", width: 150 },
  { type: "text", headerName: "LBL_STREENAME_ADDRESS", field: "STREET_ADDR_DESC", align: "left", width: 200 },
  { type: "text", headerName: "LBL_LOT_ADDRESS", field: "JIBEON_ADDR_DESC", align: "left", width: 200 },
  { type: "text", headerName: "LBL_TEL_NO", field: "REP_CNTC_NO", align: "center", width: 100 },
  { type: "combo", headerName: "LBL_POLL_DIV_CD", field: "POLL_DIV_CD", codeKey: "pollDivCd", align: "center", width: 100 },
  { type: "check", headerName: "LBL_USE_Y/N", field: "USE_YN", align: "center", width: 60, editable: true, defaultValue: "Y" },
];

// ── sub01: 주유소별 평균유가 (일자별, 읽기전용) ──────────────────────
export const SUB01_COLUMN_DEFS = [
  { type: "date", headerName: "LBL_DT", field: "DLVRY_DT", align: "center", flex: 1 },
  { type: "numeric", headerName: "LBL_AVG_OIL_PRICE", field: "OIL_PRICE", align: "right", flex: 1, valueFormatter: priceFormatter },
  { type: "text", headerName: "LBL_INSERT_DATE", field: "CRE_DTTM", align: "center", flex: 1 },
];
