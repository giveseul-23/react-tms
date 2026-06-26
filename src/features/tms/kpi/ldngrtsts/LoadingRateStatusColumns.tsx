// 그리드 컬럼 정의 (서버 LoadingRateStatusMain/Sub01/Sub02 기준)
// 적재율 현황 — 조회 전용(read-only). 서버 editDisabled/insertDisabled 컬럼은 editable 미지정.
// audit 컬럼 없음(View 에서 audit={false}).
//
// 메인 그리드는 동적 컬럼(차량유형별) — Controller 가 searchVehTpLgst 메타로 재생성한다.
//   MAIN_HEAD(일자/요일) → 차량유형별 배차수 → MAIN_TAIL(차량합계/적재율/운송비)

// ── 메인: HEAD (일자 / 요일) ───────────────────────────────────────
export const MAIN_HEAD = [
  { type: "date", headerName: "LBL_DT", field: "DLVRY_DT", align: "center" },
  { type: "text", headerName: "LBL_DAYS", field: "DAY", align: "center" },
];

// ── 적재율/수량 본문 컬럼 (메인 TAIL / sub02 공용) ──────────────────
// 부피·중량·팔레트·롤테이너·pbox·box·FQ1~5 수량 및 적재율
const QTY_RATE_COLUMNS = [
  { type: "numeric", headerName: "LBL_VOL", field: "PLN_NET_VOL", align: "right" },
  { type: "numeric", headerName: "LBL_LOADING_RATE_CBM", field: "PLN_NET_VOL_RT", align: "right" },
  { type: "numeric", headerName: "LBL_VOL", field: "PLN_GRS_VOL", align: "right" },
  { type: "numeric", headerName: "LBL_LOADING_RATE_CBM", field: "PLN_GRS_VOL_RT", align: "right" },
  { type: "numeric", headerName: "LBL_WGT", field: "PLN_NET_WGT", align: "right" },
  { type: "numeric", headerName: "LBL_WGT_LOADING_RATE", field: "PLN_NET_WGT_RT", align: "right" },
  { type: "numeric", headerName: "LBL_WGT", field: "PLN_GRS_WGT", align: "right" },
  { type: "numeric", headerName: "LBL_WGT_LOADING_RATE", field: "PLN_GRS_WGT_RT", align: "right" },
  { type: "numeric", headerName: "LBL_PLT_QTY", field: "PLN_PLT_QTY", align: "right" },
  { type: "numeric", headerName: "LBL_PLN_PLT_QTY_RT", field: "PLN_PLT_RT", align: "right" },
  { type: "numeric", headerName: "LBL_RTNR_QTY", field: "PLN_RTNR_QTY", align: "right" },
  { type: "numeric", headerName: "LBL_RTNR_QTY_LOADING_RATE", field: "PLN_RTNR_RT", align: "right" },
  { type: "numeric", headerName: "LBL_PBOX_QTY", field: "PLN_PBOX_QTY", align: "right" },
  { type: "numeric", headerName: "LBL_PLN_PBOX_QTY_RT", field: "PLN_PBOX_RT", align: "right" },
  { type: "numeric", headerName: "LBL_BOX_QTY", field: "PLN_BOX_QTY", align: "right" },
  { type: "numeric", headerName: "LBL_PLN_BOX_QTY_RT", field: "PLN_BOX_RT", align: "right" },
  { type: "numeric", headerName: "LBL_FLEX_QTY1", field: "PLN_FLEX_QTY1", align: "right" },
  { type: "numeric", headerName: "LBL_LOADING_RATE_FLEX_QTY1", field: "PLN_FLEX_QTY1_RT", align: "right" },
  { type: "numeric", headerName: "LBL_FLEX_QTY2", field: "PLN_FLEX_QTY2", align: "right" },
  { type: "numeric", headerName: "LBL_LOADING_RATE_FLEX_QTY2", field: "PLN_FLEX_QTY2_RT", align: "right" },
  { type: "numeric", headerName: "LBL_FLEX_QTY3", field: "PLN_FLEX_QTY3", align: "right" },
  // 서버 원본: FQ3 적재율 dataIndex 가 PLN_FLEX_QTY1_RT 로 지정됨(원본 유지)
  { type: "numeric", headerName: "LBL_LOADING_RATE_FLEX_QTY3", field: "PLN_FLEX_QTY1_RT", colId: "PLN_FLEX_QTY3_RT_DUP", align: "right" },
  { type: "numeric", headerName: "LBL_FLEX_QTY4", field: "PLN_FLEX_QTY4", align: "right" },
  { type: "numeric", headerName: "LBL_LOADING_RATE_FLEX_QTY4", field: "PLN_FLEX_QTY4_RT", align: "right" },
  { type: "numeric", headerName: "LBL_FLEX_QTY5", field: "PLN_FLEX_QTY5", align: "right" },
  { type: "numeric", headerName: "LBL_LOADING_RATE_FLEX_QTY5", field: "PLN_FLEX_QTY5_RT", align: "right" },
];

// ── 운송비 컬럼 (메인/sub02 공용 꼬리) ──────────────────────────────
const COST_COLUMNS = [
  { type: "numeric", headerName: "LBL_TRANS_COST", field: "TTL_CFM_COST", align: "right" },
  { type: "numeric", headerName: "LBL_TRANS_COST_WITH_TAX", field: "TTL_CFM_COST_WITH_TAX", align: "right" },
  { type: "numeric", headerName: "LBL_TRANS_COST_KG", field: "TTL_CFM_COST_KG", align: "right" },
  { type: "numeric", headerName: "LBL_TRANS_COST_WITH_TAX_KG", field: "TTL_CFM_COST_KG_WITH_TAX", align: "right" },
  { type: "numeric", headerName: "LBL_FLEX_QTY3_RT", field: "TTL_LD_FLEX_QTY3_RT", align: "right" },
  { type: "numeric", headerName: "LBL_FLEX_QTY4_RT", field: "TTL_LD_FLEX_QTY4_RT", align: "right" },
];

// ── 메인: TAIL (차량합계 + 적재율/수량 + 운송비) ─────────────────────
export const MAIN_TAIL = [
  { type: "numeric", headerName: "LB_VEH_SUM", field: "TTL_QTY", align: "right" },
  ...QTY_RATE_COLUMNS,
  ...COST_COLUMNS,
];

// 정적 fallback (조회 전 초기 컬럼). 조회 시 Controller 가 동적 컬럼으로 교체.
export const MAIN_COLUMN_DEFS = [...MAIN_HEAD, ...MAIN_TAIL];

// 차량유형별 동적 컬럼 메타 (searchVehTpLgst 응답 dsOut)
export interface VehTpMeta {
  VEH_TP_NM: string;
  VEH_TP_CD: string;
  LDNG_RT_STD?: string;
}

// 메인 동적 컬럼 빌드 (서버 createColumns: header + 차량유형별 배차수 + tail)
export function buildMainColumns(vehTpList: VehTpMeta[]): any[] {
  const body = (vehTpList ?? []).map((c) => ({
    type: "numeric",
    headerName: c.VEH_TP_NM,
    noLang: true,
    field: `${String(c.VEH_TP_CD).replace(".", "_")}_QTY`,
    align: "right",
  }));
  return [...MAIN_HEAD, ...body, ...MAIN_TAIL];
}

// 설명 패널 텍스트 (적재비율기준(kg): 차량유형(기준) ...)
export function buildDescText(vehTpList: VehTpMeta[]): string {
  let msg = "적재비율기준(kg): ";
  for (const c of vehTpList ?? []) {
    msg += ` ${c.VEH_TP_NM}(${c.LDNG_RT_STD ?? ""})`;
  }
  return msg;
}

// ── sub01: 차량유형별 요약 ─────────────────────────────────────────
export const SUB01_COLUMN_DEFS: any[] = [
  { type: "text", headerName: "LBL_VEHICLE_TYPE", field: "VEH_TP_NM", align: "left" },
  { type: "numeric", headerName: "LBL_DSPCH_CNT", field: "TTL_QTY", align: "right" },
  { type: "numeric", headerName: "LBL_VOL", field: "PLN_NET_VOL", align: "right" },
  { type: "numeric", headerName: "LBL_VOL", field: "PLN_GRS_VOL", align: "right" },
  { type: "numeric", headerName: "LBL_WGT", field: "PLN_NET_WGT", align: "right" },
  { type: "numeric", headerName: "LBL_WGT", field: "PLN_GRS_WGT", align: "right" },
  { type: "numeric", headerName: "LBL_PLT_QTY", field: "PLN_PLT_QTY", align: "right" },
  { type: "numeric", headerName: "LBL_RTNR_QTY", field: "PLN_RTNR_QTY", align: "right" },
  { type: "numeric", headerName: "LBL_PBOX_QTY", field: "PLN_PBOX_QTY", align: "right" },
  { type: "numeric", headerName: "LBL_BOX_QTY", field: "PLN_BOX_QTY", align: "right" },
  { type: "numeric", headerName: "LBL_FLEX_QTY1", field: "PLN_FLEX_QTY1", align: "right" },
  { type: "numeric", headerName: "LBL_FLEX_QTY2", field: "PLN_FLEX_QTY2", align: "right" },
  { type: "numeric", headerName: "LBL_FLEX_QTY3", field: "PLN_FLEX_QTY3", align: "right" },
  { type: "numeric", headerName: "LBL_FLEX_QTY4", field: "PLN_FLEX_QTY4", align: "right" },
  { type: "numeric", headerName: "LBL_FLEX_QTY5", field: "PLN_FLEX_QTY5", align: "right" },
  { type: "numeric", headerName: "LBL_TRANS_COST", field: "TTL_CFM_COST", align: "right" },
  { type: "numeric", headerName: "LBL_TRANS_COST_WITH_TAX", field: "TTL_CFM_COST_WITH_TAX", align: "right" },
  { type: "numeric", headerName: "LBL_TRANS_COST_KG", field: "TTL_CFM_COST_KG", align: "right" },
  { type: "numeric", headerName: "LBL_TRANS_COST_WITH_TAX_KG", field: "TTL_CFM_COST_KG_WITH_TAX", align: "right" },
  { type: "numeric", headerName: "LBL_FLEX_QTY3_RT", field: "TTL_LD_FLEX_QTY3_RT", align: "right" },
];

// ── sub02: 차량단위 상세 ───────────────────────────────────────────
export const SUB02_COLUMN_DEFS: any[] = [
  { type: "text", headerName: "LBL_DLVRY_DATE", field: "DLVRY_DT", align: "center", hide: true, excelPrint: true },
  { type: "text", headerName: "LBL_DAYS", field: "DAY", align: "center", hide: true, excelPrint: true },
  { type: "text", headerName: "LBL_VEHICLE_TYPE", field: "VEH_TP_NM", align: "left", hide: true, excelPrint: true },
  { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO", align: "left" },
  {
    type: "combo",
    headerName: "LBL_VEHICLE_OPERATION_TYPE",
    field: "VEH_OP_TP",
    codeKey: "vehOpTypeList",
    headerClass: "ag-header-center",
    width: 120,
    cellStyle: { textAlign: "center" },
  },
  { type: "numeric", headerName: "LBL_DSPCH_CNT", field: "TTL_QTY", align: "right" },
  ...QTY_RATE_COLUMNS,
  ...COST_COLUMNS,
];
