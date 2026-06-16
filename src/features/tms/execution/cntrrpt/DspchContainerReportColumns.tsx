// 그리드 컬럼 정의 (서버 DspchContainerReportMain/Sub01/Sub02 기준)
// 조회 전용 리포트 — 편집 없음. audit/EDIT_STS 컬럼은 사용하지 않는다(View 에서 audit={false}).

import { Lang } from "@/app/services/common/Lang";

// 수량 셀 하이라이트 (서버 highlightQty 대응) — 값 > 0 이면 연초록 배경 + 초록 볼드
const qtyCellStyle = (p: any) => {
  const n = parseInt(String(p?.value ?? ""), 10);
  if (!n || n <= 0) return null;
  return { backgroundColor: "#d4f5c1", color: "#15a620", fontWeight: "bold" };
};

// 용차여부(구분) 셀 스타일 — VEH_OP_TP === '100' 이면 연주황 배경 + 회색 볼드
const trckTypeCellStyle = (p: any) =>
  String(p?.data?.VEH_OP_TP) === "100"
    ? { textAlign: "center", backgroundColor: "#fff0b3", color: "#4d4d4d", fontWeight: "bold" }
    : { textAlign: "center" };

// Sub01/Sub02 용차여부 값 변환 — VEH_OP_TP === '100' → 직영(DD), 그 외 → 위탁(DC)
const trckTypeValueGetter = (p: any) =>
  String(p?.data?.VEH_OP_TP) === "100"
    ? Lang.get("LBL_DD_DSPCH_QTY")
    : Lang.get("LBL_DC_DSPCH_QTY");

// 입/출고 수량 쌍 그룹 생성 헬퍼 (서버 IN_COUNT=출고/OUT_COUNT=입고 매핑 보존)
const qtyPair = (
  headerName: string,
  inField: string,
  inExcel: string,
  outField: string,
  outExcel: string,
  groupOpts: Record<string, any> = {},
) => ({
  headerName,
  ...groupOpts,
  children: [
    {
      type: "numeric",
      headerName: "LBL_OUTBOUND",
      field: inField,
      width: 38,
      excelColName: inExcel,
      cellStyle: qtyCellStyle,
    },
    {
      type: "numeric",
      headerName: "LBL_INBOUND",
      field: outField,
      width: 38,
      excelColName: outExcel,
      cellStyle: qtyCellStyle,
    },
  ],
});

// 13개 수량 그룹 (3개 그리드 공통)
const QTY_GROUPS = [
  qtyPair("KPP", "P1_IN_COUNT", "LBL_P1_INBOUND", "P1_OUT_COUNT", "LBL_P1_OUTBOUND", { noLang: true }),
  qtyPair(Lang.get("LBL_AJU") + " PLT", "P2_IN_COUNT", "LBL_P2_INBOUND", "P2_OUT_COUNT", "LBL_P2_OUTBOUND", { noLang: true }),
  qtyPair(Lang.get("LBL_ETC_SETTING") + " PLT", "P3_IN_COUNT", "LBL_P3_INBOUND", "P3_OUT_COUNT", "LBL_P3_OUTBOUND", { noLang: true }),
  qtyPair("LBL_SLV_BOGIE", "R1_IN_COUNT", "LBL_R1_INBOUND", "R1_OUT_COUNT", "LBL_R1_OUTBOUND"),
  qtyPair("LBL_BLU_BOGIE", "R2_IN_COUNT", "LBL_R2_INBOUND", "R2_OUT_COUNT", "LBL_R2_OUTBOUND"),
  qtyPair("LBL_PICK_BOGIE", "R3_IN_COUNT", "LBL_R3_INBOUND", "R3_OUT_COUNT", "LBL_R3_OUTBOUND"),
  qtyPair("LBL_TRANSFER_BOGIE", "O1_IN_COUNT", "LBL_O1_INBOUND", "O1_OUT_COUNT", "LBL_O1_OUTBOUND"),
  qtyPair("LBL_LENDING_BORROWING", "O2_IN_COUNT", "LBL_O2_INBOUND", "O2_OUT_COUNT", "LBL_O2_OUTBOUND"),
  qtyPair("LBL_TRANSPORTATION", "O3_IN_COUNT", "LBL_O3_INBOUND", "O3_OUT_COUNT", "LBL_O3_OUTBOUND"),
  qtyPair("LBL_PICK_BOX_LENDING_BORROWING", "O4_IN_COUNT", "LBL_O4_INBOUND", "O4_OUT_COUNT", "LBL_O4_OUTBOUND"),
  qtyPair("LBL_PICK_BOX_TRANSPORTATION", "O5_IN_COUNT", "LBL_O5_INBOUND", "O5_OUT_COUNT", "LBL_O5_OUTBOUND"),
];

// 차량관리자 그룹 — Main: TRCK_TYPE 은 VEH_OP_TP==100 만 강조(값 그대로)
const VEHICLE_MANAGER_MAIN = {
  headerName: "LBL_VEHICLE_MANAGER",
  children: [
    { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO", align: "center", width: 80 },
    { type: "text", headerName: "LBL_CARRIER_NAME", field: "CARR_NM", width: 80 },
    { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO", align: "center", width: 90 },
    { type: "text", headerName: "LBL_DRIVER_NAME", field: "DRVR_NM", align: "center", width: 60 },
    { type: "text", headerName: "LBL_VEHICLE_OPERATION_TYPE", field: "VEH_OP_TP", align: "center", width: 60, hide: true },
    { type: "text", headerName: "LBL_VEH_TP_NM", field: "VEH_TP_NM", align: "center", width: 60 },
    { type: "text", headerName: "LBL_DIV", field: "TRCK_TYPE", width: 40, cellStyle: trckTypeCellStyle },
  ],
};

// 차량관리자 그룹 — Sub01/Sub02: TRCK_TYPE 값 변환(직영/위탁) + 직영 강조
const VEHICLE_MANAGER_SUB = {
  headerName: "LBL_VEHICLE_MANAGER",
  children: [
    { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO", align: "center", width: 80 },
    { type: "text", headerName: "LBL_CARRIER_NAME", field: "CARR_NM", width: 80 },
    { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO", align: "center", width: 90 },
    { type: "text", headerName: "LBL_DRIVER_NAME", field: "DRVR_NM", align: "center", width: 60 },
    { type: "text", headerName: "LBL_VEHICLE_OPERATION_TYPE", field: "VEH_OP_TP", align: "center", width: 60, hide: true },
    { type: "text", headerName: "LBL_VEH_TP_NM", field: "VEH_TP_NM", align: "center", width: 60 },
    { type: "text", headerName: "LBL_DIV", field: "TRCK_TYPE", width: 40, cellStyle: trckTypeCellStyle, valueGetter: trckTypeValueGetter },
  ],
};

// 출발지정보 그룹
const DEPARTURE_INFO = {
  headerName: "LBL_DEPARTURE_INFO",
  children: [
    { type: "text", headerName: "LBL_DEPARTURE_CODE", field: "PICK_LOC_CD", align: "center", width: 80 },
    { type: "text", headerName: "LBL_DEPARTURE_NAME", field: "PICK_LOC_NM", align: "left", width: 80 },
    { type: "datetime", headerName: "LBL_ATD_DTTM", field: "PICK_ATD", align: "center", width: 55 },
  ],
};

// 점포정보 그룹
const LOC_INFO = {
  headerName: "LBL_LOC_INFO",
  children: [
    { type: "text", headerName: "LBL_LOCATION_CODE", field: "LOC_CD", align: "center", width: 60 },
    { type: "text", headerName: "LBL_LOCATION_NAME", field: "LOC_NM", align: "left", width: 70 },
    { type: "datetime", headerName: "LBL_ETA_DTTM", field: "ETA_DTTM", align: "center", width: 74 },
    { type: "datetime", headerName: "LBL_ATA_DTTM", field: "ATA_DTTM", align: "center", width: 55 },
  ],
};

const LGST_GRP_CD_COL = { type: "text", headerName: "LBL_LOGISTICS_GROUP_CODE", field: "LGST_GRP_CD", align: "center", width: 60 };
const DLVRY_DT_COL = { type: "date", headerName: "LBL_DLVRY_DATE", field: "DLVRY_DT", align: "center", width: 70 };
const BATCH_NO_COL = { type: "text", headerName: "LBL_BATCH", field: "BATCH_NO", align: "center", width: 40, hide: true };

// ── byDay (메인): 물류센터 / 배송일 / 배치 / 회전수(우) / 차량관리자 / 출발지 / 점포 / 수량 ──
export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  LGST_GRP_CD_COL,
  DLVRY_DT_COL,
  BATCH_NO_COL,
  { type: "numeric", headerName: "LBL_TRIP_COUNT", field: "RTN_NO", align: "right", width: 50 },
  VEHICLE_MANAGER_MAIN,
  DEPARTURE_INFO,
  LOC_INFO,
  ...QTY_GROUPS,
];

// ── byLoc (Sub01): 물류센터 / 출발지 / 점포 / 배송일 / 배치 / 회전수(중) / 차량관리자 / 수량 ──
export const SUB01_COLUMN_DEFS = [
  { headerName: "No" },
  LGST_GRP_CD_COL,
  DEPARTURE_INFO,
  LOC_INFO,
  DLVRY_DT_COL,
  BATCH_NO_COL,
  { type: "numeric", headerName: "LBL_TRIP_COUNT", field: "RTN_NO", align: "center", width: 50 },
  VEHICLE_MANAGER_SUB,
  ...QTY_GROUPS,
];

// ── byVeh (Sub02): 물류센터 / 배송일 / 배치 / 회전수(중) / 차량관리자 / 출발지 / 점포 / 수량 ──
export const SUB02_COLUMN_DEFS = [
  { headerName: "No" },
  LGST_GRP_CD_COL,
  DLVRY_DT_COL,
  BATCH_NO_COL,
  { type: "numeric", headerName: "LBL_TRIP_COUNT", field: "RTN_NO", align: "center", width: 50 },
  VEHICLE_MANAGER_SUB,
  DEPARTURE_INFO,
  LOC_INFO,
  ...QTY_GROUPS,
];
