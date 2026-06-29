// 그리드 컬럼 정의 (서버 OilPriceByDayMain / Sub01 / Sub02 기준)
// 모든 컬럼 읽기전용 (insertDisabled/editDisabled). audit 컬럼은 사용 안 함.

// 평균유가 소수 2자리 표기 (서버 onRenderer: (value*1).toFixed(2))
const priceFormatter = (p: any) => {
  const n = Number(String(p?.value ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n.toFixed(2) : "";
};

// ── 메인: 일자별 평균유가 ──────────────────────────────────────────
export const MAIN_COLUMN_DEFS = [
  { type: "date", headerName: "LBL_DT", field: "DLVRY_DT", align: "center", flex: 1 },
  { type: "numeric", headerName: "LBL_AVG_OIL_PRICE", field: "OIL_PRICE", align: "right", flex: 1, valueFormatter: priceFormatter },
  { type: "text", headerName: "LBL_INSERT_DATE", field: "CRE_DTTM", align: "center", flex: 1 },
];

// ── sub01: 광역시도별 평균유가 ──────────────────────────────────────
export const SUB01_COLUMN_DEFS = [
  { type: "combo", headerName: "LVL_LV1_CD", field: "LV1_CD", codeKey: "lvl1Cd", align: "center", flex: 1 },
  { type: "numeric", headerName: "LBL_AVG_OIL_PRICE", field: "OIL_PRICE", align: "right", flex: 1, valueFormatter: priceFormatter },
  { type: "text", headerName: "LBL_INSERT_DATE", field: "CRE_DTTM", align: "center", flex: 1 },
];

// ── sub02: 시군구별 평균유가 ────────────────────────────────────────
export const SUB02_COLUMN_DEFS = [
  { type: "text", headerName: "LVL_LV2_CD", field: "LV2_NM", align: "center", flex: 1 },
  { type: "numeric", headerName: "LBL_AVG_OIL_PRICE", field: "OIL_PRICE", align: "right", flex: 1, valueFormatter: priceFormatter },
  { type: "text", headerName: "LBL_INSERT_DATE", field: "CRE_DTTM", align: "center", flex: 1 },
];
