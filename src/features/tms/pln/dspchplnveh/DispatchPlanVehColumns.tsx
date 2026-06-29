// 그리드 컬럼 정의 (서버 maingrid 4종 대응). audit 컬럼은 화면에서 제외(조회 전용 계획 그리드).
// 모든 컬럼 read-only (서버 editDisabled+insertDisabled) → insertable/editable 미지정.

import { Lang } from "@/app/services/common/Lang";

// 자차 그리드 회전 컬럼 최대 개수 (이 값만 조정하면 회전 컬럼 수가 바뀐다).
//  ※ View(DispatchPlanVeh)에서 import 하면 View↔Columns 순환참조로 모듈 로드 시 TDZ 가
//     발생하므로 여기(Columns)에 정의한다. 다른 곳에서 필요하면 이 파일에서 import.
export const lastRotation = 8;

// "%" 적재율 포맷 (서버 onRenderer value.toFixed(1)+'%')
const pctFormatter = (p: any) => {
  const raw = String(p.value ?? "").replace(/,/g, "");
  const n = parseFloat(raw);
  return `${(Number.isFinite(n) && n > 0 ? n : 0).toFixed(1)}%`;
};

// 거리 정수 포맷 (서버 value.toFixed(0), 0 이하 공란)
const distFormatter = (p: any) => {
  const n = Number(p.value);
  return Number.isFinite(n) && n > 0 ? n.toFixed(0) : "";
};

// ── 착지계획 탭1: 착지별 물량 ──────────────────────────────────────
export const LOCATION_SHPM_VOLUME_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_DEPARTURE",
    field: "FRM_LOC_NM",
    align: "left",
    width: 100,
  },
  {
    type: "text",
    headerName: "LBL_DESTINATION_EX",
    field: "TO_LOC_NM",
    align: "left",
    width: 100,
  },
  {
    type: "numeric",
    headerName: "LBL_DSPCH_CNT",
    field: "DSPCH_CNT",
    width: 60,
    align: "right",
  },
  {
    type: "text",
    headerName: "LBL_STATUS",
    field: "PLN_STS",
    width: 60,
    align: "center",
  },
  // 전체/미배정 수량 그룹 (LBL_TOTAL / LBL_UNASGN_QTY)
  {
    headerName: "LBL_TOTAL",
    children: [
      {
        type: "numeric",
        headerName: "LBL_VOL",
        field: "PLN_NET_VOL",
        width: 80,
        align: "right",
      },
      {
        type: "numeric",
        headerName: "LBL_VOL",
        field: "PLN_GRS_VOL",
        width: 80,
        align: "right",
      },
      {
        type: "numeric",
        headerName: "LBL_WEIGHT_KG",
        field: "PLN_NET_WGT",
        width: 80,
        align: "right",
      },
      {
        type: "numeric",
        headerName: "LBL_WEIGHT_KG",
        field: "PLN_GRS_WGT",
        width: 80,
        align: "right",
      },
      {
        type: "numeric",
        headerName: "LBL_PBOX",
        field: "PLN_PBOX_QTY",
        width: 80,
        align: "right",
      },
      {
        type: "numeric",
        headerName: "LBL_BOX",
        field: "PLN_BOX_QTY",
        width: 80,
        align: "right",
      },
      {
        type: "numeric",
        headerName: "LBL_PLT",
        field: "PLN_PLT_QTY",
        width: 80,
        align: "right",
      },
      {
        type: "numeric",
        headerName: "LBL_ROLLTAINER",
        field: "PLN_RTNR_QTY",
        width: 80,
        align: "right",
      },
      {
        type: "numeric",
        headerName: "LBL_FLEX_QTY1",
        field: "PLN_FLEX_QTY1",
        width: 80,
        align: "right",
      },
      {
        type: "numeric",
        headerName: "LBL_FLEX_QTY2",
        field: "PLN_FLEX_QTY2",
        width: 80,
        align: "right",
      },
      {
        type: "numeric",
        headerName: "LBL_FLEX_QTY3",
        field: "PLN_FLEX_QTY3",
        width: 80,
        align: "right",
      },
      {
        type: "numeric",
        headerName: "LBL_FLEX_QTY4",
        field: "PLN_FLEX_QTY4",
        width: 80,
        align: "right",
      },
      {
        type: "numeric",
        headerName: "LBL_FLEX_QTY5",
        field: "PLN_FLEX_QTY5",
        width: 80,
        align: "right",
      },
    ],
  },
];

// ── 착지계획 탭2: 착지별 배차내역 ──────────────────────────────────
export const LOCATION_DSPCH_COLUMN_DEFS = [
  {
    type: "text",
    headerName: "LBL_STATUS",
    field: "DSPCH_OP_STS_IMZ",
    align: "center",
    width: 40,
  },
  {
    type: "text",
    headerName: "LBL_LANE",
    field: "PATH",
    align: "left",
    width: 100,
  },
  {
    type: "text",
    headerName: "LBL_VEH_NO",
    field: "VEH_NO",
    align: "center",
    width: 100,
  },
  {
    type: "text",
    headerName: "LBL_DRVR_NM",
    field: "DRVR_NM",
    align: "center",
    width: 100,
  },
  {
    type: "text",
    headerName: "LBL_VEHICLE_TYPE",
    field: "VEH_TP_NM",
    align: "left",
    width: 80,
  },
  {
    type: "numeric",
    headerName: "LBL_LOADING_RATE",
    field: "PLN_LD_RT",
    width: 70,
    align: "right",
    valueFormatter: pctFormatter,
  },
  // 배차진행상태 — codeKey(라벨) + statusEnum(배지 색). 공통 statusEnums 관리.
  {
    type: "combo",
    headerName: "LBL_OP_STATUS",
    field: "DSPCH_OP_STS",
    codeKey: "dspchOpSts",
    statusStyle: "DSPCH_OP_STS",
    align: "center",
    width: 80,
  },
  {
    type: "text",
    headerName: "LBL_ACCEPT_WAITTIME",
    field: "ACPT_WAITTIME",
    align: "center",
    width: 60,
  },
  {
    type: "text",
    headerName: "LBL_SEND_SMS_DTTM",
    field: "SMS_APP_INST_DTTM",
    align: "center",
    width: 60,
  },
  {
    headerName: "LBL_VOL",
    children: [
      {
        type: "numeric",
        headerName: "CBM",
        noLang: true,
        field: "PLN_NET_VOL",
        width: 80,
        align: "right",
      },
      {
        type: "numeric",
        headerName: "LBL_LOADING_RATE",
        field: "PLN_NET_VOL_RT",
        width: 70,
        align: "right",
        valueFormatter: pctFormatter,
      },
    ],
  },
  {
    headerName: "LBL_WGT",
    children: [
      {
        type: "numeric",
        headerName: "Kg",
        noLang: true,
        field: "PLN_NET_WGT",
        width: 80,
        align: "right",
      },
      {
        type: "numeric",
        headerName: "LBL_LOADING_RATE",
        field: "PLN_NET_WGT_RT",
        width: 70,
        align: "right",
        valueFormatter: pctFormatter,
      },
    ],
  },
  {
    headerName: "LBL_FLEX_QTY1",
    children: [
      {
        type: "numeric",
        headerName: "CBM",
        noLang: true,
        field: "PLN_FLEX_QTY1",
        width: 80,
        align: "right",
      },
      {
        type: "numeric",
        headerName: "LBL_LOADING_RATE",
        field: "PLN_FLEX_QTY2_RT",
        width: 70,
        align: "right",
        valueFormatter: pctFormatter,
      },
    ],
  },
  {
    headerName: "LBL_FLEX_QTY2",
    children: [
      {
        type: "numeric",
        headerName: "CBM",
        noLang: true,
        field: "PLN_FLEX_QTY2",
        width: 80,
        align: "right",
      },
      {
        type: "numeric",
        headerName: "LBL_LOADING_RATE",
        field: "PLN_FLEX_QTY2_RT",
        width: 70,
        align: "right",
        valueFormatter: pctFormatter,
      },
    ],
  },
  {
    headerName: "LBL_FLEX_QTY3",
    children: [
      {
        type: "numeric",
        headerName: "CBM",
        noLang: true,
        field: "PLN_FLEX_QTY3",
        width: 80,
        align: "right",
      },
      {
        type: "numeric",
        headerName: "LBL_LOADING_RATE",
        field: "PLN_FLEX_QTY3_RT",
        width: 70,
        align: "right",
        valueFormatter: pctFormatter,
      },
    ],
  },
  {
    headerName: "LBL_FLEX_QTY4",
    children: [
      {
        type: "numeric",
        headerName: "CBM",
        noLang: true,
        field: "PLN_FLEX_QTY4",
        width: 80,
        align: "right",
      },
      {
        type: "numeric",
        headerName: "LBL_LOADING_RATE",
        field: "PLN_FLEX_QTY4_RT",
        width: 70,
        align: "right",
        valueFormatter: pctFormatter,
      },
    ],
  },
  {
    headerName: "LBL_FLEX_QTY5",
    children: [
      {
        type: "numeric",
        headerName: "CBM",
        noLang: true,
        field: "PLN_FLEX_QTY5",
        width: 80,
        align: "right",
      },
      {
        type: "numeric",
        headerName: "LBL_LOADING_RATE",
        field: "PLN_FLEX_QTY5_RT",
        width: 70,
        align: "right",
        valueFormatter: pctFormatter,
      },
    ],
  },
  {
    type: "text",
    headerName: "LBL_DISPATCH_NO",
    field: "DSPCH_NO",
    align: "center",
    width: 80,
  },
];

// 회전(rotation) 컬럼 1~8 생성 (서버 RTN_PATH_B1_Rn + DRVR_RESEQ_B1_Rn 컬러)
//  DRVR_RESEQ_B1_Rn === 'Y' → 연두색 배경 (Util.getLightGreenColor)
const rotationCol = (n: number) => ({
  type: "text",
  headerName: `${n + Lang.get("LBL_ROTATION")}`,
  noLang: true, // 서버 text:'n'+Lang.get('LBL_ROTATION') — TODO: 숫자+회전 합성 라벨
  field: `RTN_PATH_B1_R${n}`,
  align: "left",
  width: 130,
  cellStyle: (p: any) =>
    p.data?.[`DRVR_RESEQ_B1_R${n}`] === "Y"
      ? { backgroundColor: "#d9f2d9", color: "#000" }
      : undefined,
});

// 자차 행은 DSPCH_NO 가 직접 없고 회전별 배차키(TRIP_KEY_B1_R1~R{lastRotation})로 들어온다.
// (서버 TRIP_KEY = TRIP_ID = 배차 식별자) — 회전 컬럼과 동일 네이밍/개수로 추출한다.
//  getDispatchTripKeys: 배차가 있는 회전들의 배차키 배열 (빈 값 제외).
export const getDispatchTripKeys = (row: any): any[] =>
  Array.from(
    { length: lastRotation },
    (_, i) => row?.[`TRIP_KEY_B1_R${i + 1}`],
  ).filter((v) => v != null && v !== "");

// 첫 번째(가장 앞 회전) 배차키 — 단건 배차메모 등에서 DSPCH_NO 대용.
export const getFirstDispatchTripKey = (row: any): any =>
  getDispatchTripKeys(row)[0] ?? "";

// ── 자차배차계획 (center) ──────────────────────────────────────────
export const DEDICATED_TRUCK_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_VEH_ID", field: "VEH_ID", hide: true },
  {
    type: "text",
    headerName: "LBL_VEH_NO",
    field: "VEH_NO",
    align: "center",
    width: 90,
    pinned: "left" as const,
  },
  {
    type: "text",
    headerName: "LBL_DRVR_NM",
    field: "DRVR_NM",
    align: "center",
    width: 60,
    pinned: "left" as const,
  },
  // 차량유형 — codeKey(vehTp)
  {
    type: "combo",
    headerName: "LBL_VEH_TP_NM",
    field: "VEH_TP_CD",
    codeKey: "vehTp",
    align: "left",
    width: 50,
    pinned: "left" as const,
  },
  // 작업상태 — '휴무' 행 주황 배경 (Util.getOrangeColor)
  {
    type: "text",
    headerName: "LBL_WORK_TYPE_PLAN",
    field: "WORK_STS",
    align: "left",
    width: 60,
    pinned: "left" as const,
    cellStyle: (p: any) =>
      p.data?.WORK_STS === "휴무"
        ? { backgroundColor: "#ffa500", color: "#000" }
        : undefined,
  },
  // 총거리 — 정산경로거리(TTL_FI_DIST) 와 다르면 강조
  {
    type: "numeric",
    headerName: "LBL_TOTAL_DISTANCE",
    field: "TTL_DIST",
    width: 80,
    align: "right",
    valueFormatter: distFormatter,
    pinned: "left" as const,
    cellStyle: (p: any) =>
      p.data?.TTL_FI_DIST !== p.data?.TTL_DIST
        ? { backgroundColor: "#d9f2d9", color: "#008000", fontWeight: "bold" }
        : undefined,
  },
  {
    type: "text",
    headerName: "LBL_APRVL_IDLE",
    field: "APRVL_CNT",
    hide: true,
  },
  { type: "text", field: "PAY_CARR_CD", hide: true },
  // 1~lastRotation 회전 컬럼 (루프 생성)
  ...Array.from({ length: lastRotation }, (_, i) => rotationCol(i + 1)),
  // 정산경로 거리
  {
    type: "numeric",
    headerName: "LBL_TTL_FI_DIST",
    field: "TTL_FI_DIST",
    width: 80,
    align: "right",
    valueFormatter: distFormatter,
  },
];

// 적재율(중량) 상태별 컬러 — WGT_RT_STS GOOD/OVER/LESS
const wgtRtCellStyle = (p: any) => {
  switch (p.data?.WGT_RT_STS) {
    case "GOOD":
      return {
        backgroundColor: "#e8f5e9",
        color: "#008000",
        fontWeight: "bold",
      };
    case "OVER":
      return {
        backgroundColor: "#ffebee",
        color: "#d32f2f",
        fontWeight: "bold",
      };
    case "LESS":
      return {
        backgroundColor: "#fffde7",
        color: "#f9a825",
        fontWeight: "bold",
      };
    default:
      return undefined;
  }
};

// ── 용차(스팟)배차내역 (east) ──────────────────────────────────────
export const TEMP_TRUCK_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_DISPATCH_NO",
    field: "DSPCH_NO",
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_STATUS",
    field: "DSPCH_OP_STS_IMZ",
    align: "center",
    width: 40,
  },
  // 착지명/경로 — DRVR_STOP_RESEQ_YN === 'Y' 연두 배경
  {
    type: "text",
    headerName: "LBL_LOC_NM",
    field: "PATH",
    align: "left",
    width: 100,
    cellStyle: (p: any) =>
      p.data?.DRVR_STOP_RESEQ_YN === "Y"
        ? { backgroundColor: "#d9f2d9", color: "#000" }
        : undefined,
  },
  {
    type: "text",
    headerName: "LBL_VEH_NO",
    field: "VEH_NO",
    align: "center",
    width: 100,
  },
  {
    type: "text",
    headerName: "LBL_DRVR_NM",
    field: "DRVR_NM",
    align: "center",
    width: 100,
  },
  {
    type: "combo",
    headerName: "LBL_VEH_TP_NM",
    field: "VEH_TP_CD",
    codeKey: "vehTp",
    align: "left",
    width: 60,
  },
  {
    type: "text",
    headerName: "LBL_VEH_TP_GRP",
    field: "VEH_TP_GRP",
    align: "left",
    width: 80,
  },
  {
    type: "numeric",
    headerName: "LBL_ROTATION",
    field: "RTN_NO",
    align: "right",
    width: 50,
  },
  {
    type: "text",
    headerName: "LBL_ACCEPT_WAITTIME",
    field: "ACPT_WAITTIME",
    align: "center",
    width: 60,
  },
  {
    type: "text",
    headerName: "LBL_SEND_SMS_DTTM",
    field: "DSPCH_EVNT_DTTM",
    align: "center",
    width: 60,
  },
  { type: "text", headerName: "LBL_CARR_CD", field: "CARR_CD", hide: true },
  { type: "text", field: "PAY_CARR_CD", hide: true },
  {
    type: "text",
    headerName: "LBL_CARR_NM",
    field: "CARR_NM",
    align: "left",
    width: 100,
  },
  // 배차운영상태 — codeKey(라벨) + statusEnum(배지 색). 공통 statusEnums 관리.
  {
    type: "combo",
    headerName: "LBL_DISPATCH_OPERATIONAL_STATUS",
    field: "DSPCH_OP_STS",
    codeKey: "dspchOpSts",
    statusStyle: "DSPCH_OP_STS",
    align: "center",
    width: 80,
  },
  {
    type: "text",
    headerName: "LBL_DISPATCH_NO",
    field: "DSPCH_NO",
    align: "center",
  },
  {
    type: "numeric",
    headerName: "LBL_TRIP_NO",
    field: "TRIP_ID",
    align: "center",
  },
  { type: "numeric", headerName: "LBL_TRIP_SEQ", field: "TRIP_SEQ" },
  {
    type: "numeric",
    headerName: "LBL_LOADING_RATE_CBM",
    field: "PLN_NET_VOL_RT",
    align: "right",
    width: 80,
    valueFormatter: pctFormatter,
  },
  {
    type: "numeric",
    headerName: "LBL_WGT_LOADING_RATE",
    field: "PLN_NET_WGT_RT",
    align: "right",
    width: 80,
    valueFormatter: pctFormatter,
    cellStyle: wgtRtCellStyle,
  },
  {
    type: "numeric",
    headerName: "LBL_LOADING_RATE_FLEX_QTY1",
    field: "PLN_FLEX_QTY1_RT",
    align: "right",
    width: 80,
    valueFormatter: pctFormatter,
  },
  {
    type: "numeric",
    headerName: "LBL_LOADING_RATE_FLEX_QTY2",
    field: "PLN_FLEX_QTY2_RT",
    align: "right",
    width: 80,
    valueFormatter: pctFormatter,
  },
  {
    type: "numeric",
    headerName: "LBL_LOADING_RATE_FLEX_QTY3",
    field: "PLN_FLEX_QTY3_RT",
    align: "right",
    width: 80,
    valueFormatter: pctFormatter,
  },
  {
    type: "numeric",
    headerName: "LBL_LOADING_RATE_FLEX_QTY4",
    field: "PLN_FLEX_QTY4_RT",
    align: "right",
    width: 80,
    valueFormatter: pctFormatter,
  },
  {
    type: "numeric",
    headerName: "LBL_LOADING_RATE_FLEX_QTY5",
    field: "PLN_FLEX_QTY5_RT",
    align: "right",
    width: 80,
    valueFormatter: pctFormatter,
  },
  // hidden 식별/제어 컬럼
  {
    type: "text",
    headerName: "LBL_SETTOPLN_ALLWD_YN",
    field: "ALW_SET_TO_PLN_YN",
    hide: true,
  },
  {
    type: "text",
    headerName: "LGST_GRP_CD",
    noLang: true,
    field: "LGST_GRP_CD",
    hide: true,
  },
  {
    type: "text",
    headerName: "PLN_ID",
    noLang: true,
    field: "PLN_ID",
    hide: true,
  },
  {
    type: "text",
    headerName: "DIV_CD",
    noLang: true,
    field: "DIV_CD",
    hide: true,
  },
  {
    type: "text",
    headerName: "DRVR_ID",
    noLang: true,
    field: "DRVR_ID",
    hide: true,
  },
];
