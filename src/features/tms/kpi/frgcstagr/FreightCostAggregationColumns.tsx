// 운임비용집계 (KPI) — 단일 그리드, 읽기전용 리포트 + 합계행.
// 서버 FreightCostAggregationController.createColumns 대응:
//   static HEAD ... [운반비 CFM_COST] / 동적 BODY(요금코드별) / [BOX당운임비 ...] static TAIL.
// 동적 BODY 는 /apSettlMgmtService/getChargeCodeCfWithoutLgst 메타로 buildFreightColumns 가 런타임 생성.
// 리포트(읽기전용)이라 audit 컬럼 없음 → 화면에서 audit={false}.

import { numberValueFormatter } from "@/app/components/grid/columns/commonFormatters";

// 동적 BODY 메타 (서버 dsOut: PIVOT_CHG_CD / CHG_NM)
export type FreightChgMeta = {
  PIVOT_CHG_CD: string;
  CHG_NM: string;
};

// ── HEAD: No ~ 운반비(CFM_COST) ────────────────────────────────────
export const MAIN_HEAD = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_CARRIER", field: "CARR_NM", align: "left" },
  { type: "text", headerName: "LBL_VEHICLE_NUMBER", field: "VEH_NO", align: "left" },
  { type: "text", headerName: "LBL_VEHICLE_TYPE", field: "VEH_TP_NM", align: "left" },
  { type: "text", headerName: "LBL_DT", field: "DLVRY_DT", width: 80, align: "left" },
  { type: "numeric", headerName: "LBL_FIX_SEQ", field: "RTN_NO", align: "right" },
  { type: "text", headerName: "LBL_REP_CUST_CD", field: "LOC_NM", align: "left" },
  { type: "text", headerName: "LBL_MEMO", field: "MEMO_DESC", align: "left" },
  { type: "numeric", headerName: "LBL_STOP_CNT", field: "STOP_SEQ", width: 80, align: "right" },
  { type: "numeric", headerName: "LBL_DLVRY_BOX", field: "DLVRY_BOX", width: 80, align: "right", summaryType: "sum" },
  { type: "numeric", headerName: "LBL_TRANS_WGT", field: "CFM_NET_WGT", width: 80, align: "right", summaryType: "sum" },
  { type: "numeric", headerName: "LBL_PBOX_WGT", field: "PBOX_WGT", width: 80, align: "right" },
  { type: "numeric", headerName: "LBL_TRANS_COST", field: "CFM_COST", width: 80, align: "right", summaryType: "sum" },
];

// ── TAIL: BOX당운임비 / KG당운임비 ─────────────────────────────────
export const MAIN_TAIL = [
  { type: "numeric", headerName: "LBL_TRANS_COST_BOX", field: "BOX_COST", width: 150, align: "right" },
  { type: "numeric", headerName: "LBL_TRANS_COST_KG", field: "KG_COST", width: 150, align: "right" },
];

// 동적 컬럼 미조회 시 기본값 (HEAD + TAIL)
export const MAIN_COLUMN_DEFS = [...MAIN_HEAD, ...MAIN_TAIL];

// 서버 commonBodyColumnList 대응 — 요금코드별 numeric 합계 컬럼
export function buildFreightColumns(
  head: any[],
  tail: any[],
  chgList: FreightChgMeta[],
): any[] {
  const body = chgList.map((c) => ({
    type: "numeric",
    headerName: c.CHG_NM,
    noLang: true,
    field: c.PIVOT_CHG_CD,
    width: 100,
    align: "right",
    summaryType: "sum",
    valueFormatter: numberValueFormatter,
  }));

  return [...head, ...body, ...tail];
}
