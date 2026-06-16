import {
  CENTER,
  RIGHT,
  numberValueFormatter,
} from "@/app/components/grid/columns/commonFormatters";

// ─────────────────────────────────────────────────────────────
// 메인 그리드 — HEAD (센차 addHeaderColumns 대응)
//   editType float/number → numeric + numberValueFormatter, summaryType sum → summable
//   editDisabled/insertDisabled 컬럼은 읽기전용(편집형 위젯 아님 → 기본 읽기전용)
// ─────────────────────────────────────────────────────────────
export const MAIN_HEAD = [
  { type: "text", headerName: "No", width: 40, cellStyle: RIGHT },
  // 일자
  { type: "date", headerName: "LBL_DLVRY_DATE", field: "DLVRY_DT", cellStyle: CENTER },
  // 배차번호
  { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO", cellStyle: CENTER },
  // 주문유형
  { type: "text", headerName: "LBL_ORDER_TYPE", field: "SHPM_TP_LIST", cellStyle: CENTER },
  // 지급운송협력사코드
  {
    type: "text",
    headerName: "LBL_PAY_CARRIER_CODE",
    field: "PAY_CARR_CD",
    width: 120,
    cellStyle: CENTER,
  },
  // 지급운송협력사코드명
  {
    type: "text",
    headerName: "LBL_PAY_CARRIER_NAME",
    field: "PAY_CARR_NM",
    width: 120,
  },
  // 차량번호
  { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO", width: 100, cellStyle: CENTER },
  // 차량유형
  { type: "text", headerName: "LBL_VEHICLE_TYPE", field: "VEH_TP_NM", width: 100 },
  // 운전자명
  { type: "text", headerName: "LBL_DRIVER_NAME", field: "DRVR_NM", width: 80, cellStyle: CENTER },
  // 확정중량(KG)
  {
    type: "numeric",
    headerName: "LBL_CONFIRMED_WEIGHT",
    field: "TTL_CFM_WGT",
    width: 90,
    cellStyle: { ...RIGHT, color: "red" },
    valueFormatter: numberValueFormatter,
    summable: true,
  },
  // 출발지코드
  { type: "text", headerName: "LBL_DEPARTURE_CODE", field: "FRM_LOC_CD", width: 100 },
  // 납품처수
  {
    type: "numeric",
    headerName: "LBL_DLV_CNT",
    field: "DLVRY_CNT",
    width: 90,
    cellStyle: RIGHT,
    valueFormatter: numberValueFormatter,
    summable: true,
  },
  // 경로
  { type: "text", headerName: "LBL_LANE", field: "ROUTE_PATH", width: 200 },
  // 최대직송거리
  {
    type: "numeric",
    headerName: "LBL_MAX_DIRECT_DIST",
    field: "MAX_DIRECT_DIST",
    width: 110,
    cellStyle: RIGHT,
    valueFormatter: numberValueFormatter,
    summable: true,
  },
  // 총이동거리
  {
    type: "numeric",
    headerName: "LBL_TTL_DIST",
    field: "TTL_DIST",
    width: 110,
    cellStyle: RIGHT,
    valueFormatter: numberValueFormatter,
    summable: true,
  },
  // 정산문서번호
  { type: "text", headerName: "LBL_AP_ID", field: "AP_ID", width: 140, cellStyle: CENTER },
  // 총계산금액
  {
    type: "numeric",
    headerName: "LBL_TOTAL_INS_COST",
    field: "TTL_COST",
    width: 120,
    cellStyle: { ...RIGHT, color: "#CC0000", backgroundColor: "#FAE3D7" },
    valueFormatter: numberValueFormatter,
    summable: true,
  },
];

// ─────────────────────────────────────────────────────────────
// 메인 그리드 — TAIL (센차 addTailColumns 대응)
// ─────────────────────────────────────────────────────────────
export const MAIN_TAIL = [
  // 정산마감그룹ID
  { type: "text", headerName: "LBL_FI_SETL_GRP_ID", field: "AP_SETL_GRP_ID", cellStyle: CENTER },
  // 정산마감ID
  { type: "text", headerName: "LBL_AP_SETL_ID", field: "AP_SETL_ID", width: 80, cellStyle: CENTER },
  // 상품정보
  { type: "text", headerName: "LBL_ITEM_INFO", field: "ITEM_LIST", width: 400 },
  // 계약코드
  { type: "text", headerName: "LBL_TARIFF_CODE", field: "TRF_CD", width: 200, cellStyle: CENTER },
  // 계약명
  { type: "text", headerName: "LBL_TARIFF_NAME", field: "TRF_NM", width: 200 },
];

// 조회 전 초기 컬럼 (동적 body 없음)
export const MAIN_COLUMN_DEFS = [...MAIN_HEAD, ...MAIN_TAIL];

// ─────────────────────────────────────────────────────────────
// 동적 body 컬럼 빌드 (센차 addDynamicColumns 대응)
//   dataIndex = CHG_CD.replace('.','_') + '_COST', headerName = CHG_NM (리터럴)
//   editType number → numeric + summaryType sum → summable
// ─────────────────────────────────────────────────────────────
type ChgMeta = { CHG_CD: string; CHG_NM: string };

export function buildDispathApColumns(
  head: any[],
  tail: any[],
  chgList: ChgMeta[],
): any[] {
  const body = chgList.map((c) => ({
    type: "numeric",
    headerName: c.CHG_NM,
    noLang: true,
    field: `${String(c.CHG_CD).replace(".", "_")}_COST`,
    width: 90,
    cellStyle: RIGHT,
    valueFormatter: numberValueFormatter,
    aggFunc: "sum",
    summable: true,
  }));

  return [...head, ...body, ...tail];
}
