// 그리드 컬럼 정의 (서버 NoApDispatchListController createCarrierRateDynamicCol 대응)
//  - HEAD(setHeadColumns) + 동적 BODY(setDynamicCol, 요율항목) + TAIL(setTailColumns)
//  - audit 컬럼(CRE_/UPD_)은 서버 tail 에 있으므로 여기서 직접 선언(View 의 audit 자동추가는 끔).
//  - 요율항목/요율 값은 DSPCH_EVNT_TCD 가 비어있으면 미표시(서버 onRenderer 대응).

import { numberValueFormatter } from "@/app/components/grid/columns/commonFormatters";

// 운임예약상태(DSPCH_EVNT_TCD) 가 없으면 값 숨김 (서버 onRenderer 대응)
const hideWhenNoEvnt = (p: any) => {
  const t = p?.data?.DSPCH_EVNT_TCD;
  if (t == null || t === "") return "";
  return numberValueFormatter(p);
};
const hideTextWhenNoEvnt = (p: any) => {
  const t = p?.data?.DSPCH_EVNT_TCD;
  if (t == null || t === "") return "";
  return p?.value ?? "";
};

// 운임예약상태(DSPCH_EVNT_TCD) 셀 — 값 있을 때 노랑 배경/주황 글자 (서버 onRenderer 대응)
const evntTcdCellStyle = (p: any): Record<string, string> => {
  const base = { textAlign: "center" as const };
  const v = p?.value;
  if (v != null && v !== "") {
    return { ...base, backgroundColor: "#FFFF00", color: "#ED7D31" };
  }
  return base;
};

// ── HEAD (setHeadColumns) ─────────────────────────────────────────
export const MAIN_HEAD = [
  { headerName: "No" },
  {
    type: "date",
    headerName: "LBL_DLVRY_DATE",
    field: "DLVRY_DT",
    align: "center",
    width: 100,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_DISPATCH_NO",
    field: "DSPCH_NO",
    align: "center",
    width: 120,
    editable: false,
  },
  {
    type: "combo",
    headerName: "LBL_DISPATCH_PLAN_TYPE",
    field: "DSPCH_TP",
    codeKey: "dspchTpList",
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_VEH_NO",
    field: "VEH_NO",
    align: "center",
    width: 100,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_TRIP_COUNT",
    field: "RTN_NO",
    width: 50,
    align: "right",
  },
  {
    type: "text",
    headerName: "LBL_VEHICLE_TYPE_CODE",
    field: "VEH_TP_CD",
    hide: true,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_VEHICLE_TYPE_NAME",
    field: "VEH_TP_NM",
    width: 90,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_DRIVER_NAME",
    field: "DRVR_NM",
    width: 70,
    align: "center",
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_LANE",
    field: "TO_LOC_NM",
    width: 200,
    align: "left",
  },
  {
    type: "combo",
    headerName: "LBL_DISPATCH_OPERATIONAL_STATUS",
    field: "DSPCH_OP_STS",
    codeKey: "dspchOpStsList",
    statusStyle: "DSPCH_OP_STS",
    align: "center",
    width: 90,
    editable: false,
  },
  {
    type: "combo",
    headerName: "LBL_CARR_RATE_BOOKING_STS",
    field: "DSPCH_EVNT_TCD",
    codeKey: "dspchEvntTcd",
    width: 90,
    align: "center",
    cellStyle: evntTcdCellStyle,
  },
  {
    type: "text",
    headerName: "LBL_REG_RATE",
    field: "RATE",
    width: 80,
    align: "right",
    valueFormatter: hideTextWhenNoEvnt,
  },
  {
    type: "text",
    headerName: "LBL_PAY_CARRIER_CODE",
    field: "PAY_CARR_CD",
    width: 110,
    align: "center",
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_PAY_CARRIER_NAME",
    field: "PAY_CARR_NM",
    width: 120,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_RATE_RESULT",
    field: "AP_RATE_RSLT",
    align: "center",
    width: 300,
  },
  { type: "text", field: "PAY_LGST_GRP_CD", hide: true },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
    hide: true,
    width: 120,
    align: "center",
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
    hide: true,
    width: 120,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_CARRIER_CODE",
    field: "CARR_CD",
    width: 100,
    hide: true,
    align: "center",
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_CARRIER_NAME",
    field: "CARR_NM",
    width: 100,
    hide: true,
    editable: false,
  },
];

// ── TAIL (setTailColumns) — audit 컬럼 ────────────────────────────
export const MAIN_TAIL = [
  {
    type: "datetime",
    headerName: "LBL_INSERT_DATE",
    field: "CRE_DTTM",
    align: "center",
    width: 140,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_INSERT_PERSON_ID",
    field: "CRE_USR_ID",
    align: "center",
    width: 90,
    editable: false,
  },
  {
    type: "datetime",
    headerName: "LBL_UPDATE_TIME",
    field: "UPD_DTTM",
    align: "center",
    width: 140,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_UPDATE_PERSON_ID",
    field: "UPD_USR_ID",
    align: "center",
    width: 90,
    editable: false,
  },
];

// 초기 렌더용(조회 전) — HEAD + TAIL
export const MAIN_COLUMN_DEFS = [...MAIN_HEAD, ...MAIN_TAIL];

// ── 동적 BODY 빌드 (setDynamicCol) — 요율항목(CHG_CD) 별 금액 컬럼 ──
type ChgMeta = { CHG_CD: string; CHG_NM: string };

export function buildNoApColumns(
  head: any[],
  tail: any[],
  chgList: ChgMeta[],
): any[] {
  const body = chgList.map((c) => ({
    type: "numeric",
    noLang: true,
    headerName: c.CHG_NM,
    field: c.CHG_CD,
    align: "right",
    width: 90,
    valueFormatter: hideWhenNoEvnt,
  }));
  return [...head, ...body, ...tail];
}
