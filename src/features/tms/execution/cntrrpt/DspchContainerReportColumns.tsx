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
  dlvryField: string,
  rtrnField: string,
  groupOpts: Record<string, any> = {},
) => ({
  headerName,
  ...groupOpts,
  children: [
    {
      type: "numeric",
      headerName: "LBL_INBOUND_COUNT",
      field: dlvryField,
      validators: { min: 0 },
      width: 50,
      cellStyle: qtyCellStyle,
    },
    {
      type: "numeric",
      headerName: "LBL_OUTBOUND_COUNT",
      field: rtrnField,
      validators: { min: 0 },
      width: 50,
      cellStyle: qtyCellStyle,
    },
  ],
});

// 13개 수량 그룹 (3개 그리드 공통)
export type ContainerColumnMeta = {
  CNTR_CD?: string;
  CNTR_NM?: string;
  D_CNTR_CD?: string;
};

const normalizeContainerQtyCode = (container: ContainerColumnMeta, index: number) => {
  const rawCode = String(container.D_CNTR_CD || container.CNTR_CD || `C${index + 1}`);
  return rawCode.replace(/^CD_/i, "");
};

export const buildContainerQtyColumnDefs = (containers: ContainerColumnMeta[] = []) => {
  const sorted = [...containers].sort((a, b) => String(a.CNTR_CD ?? "").localeCompare(String(b.CNTR_CD ?? "")));
  return sorted.map((container, index) => {
    const dynamicCode = normalizeContainerQtyCode(container, index);
    const cntrName = String(container.CNTR_NM || container.CNTR_CD || dynamicCode);
    return qtyPair(
      cntrName,
      `CD_${dynamicCode}_DLVRY_QTY`,
      `CD_${dynamicCode}_RTRN_QTY`,
      { noLang: true },
    );
  });
};

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
    { type: "text", headerName: "LBL_CARRIER_NAME", field: "CARR_NM", width: 100 },
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
export const buildMainColumnDefs = (containers: ContainerColumnMeta[] = []) => [
  { headerName: "No" },
  LGST_GRP_CD_COL,
  DLVRY_DT_COL,
  BATCH_NO_COL,
  { type: "numeric", headerName: "LBL_TRIP_COUNT", field: "RTN_NO", align: "right", width: 50 },
  VEHICLE_MANAGER_MAIN,
  DEPARTURE_INFO,
  LOC_INFO,
  ...buildContainerQtyColumnDefs(containers),
];

// ── byLoc (Sub01): 물류센터 / 출발지 / 점포 / 배송일 / 배치 / 회전수(중) / 차량관리자 / 수량 ──
export const buildSub01ColumnDefs = (containers: ContainerColumnMeta[] = []) => [
  { headerName: "No" },
  LGST_GRP_CD_COL,
  DEPARTURE_INFO,
  LOC_INFO,
  DLVRY_DT_COL,
  BATCH_NO_COL,
  { type: "numeric", headerName: "LBL_TRIP_COUNT", field: "RTN_NO", align: "center", width: 50 },
  VEHICLE_MANAGER_SUB,
  ...buildContainerQtyColumnDefs(containers),
];

// ── byVeh (Sub02): 물류센터 / 배송일 / 배치 / 회전수(중) / 차량관리자 / 출발지 / 점포 / 수량 ──
export const buildSub02ColumnDefs = (containers: ContainerColumnMeta[] = []) => [
  { headerName: "No" },
  LGST_GRP_CD_COL,
  DLVRY_DT_COL,
  BATCH_NO_COL,
  { type: "numeric", headerName: "LBL_TRIP_COUNT", field: "RTN_NO", align: "center", width: 50 },
  VEHICLE_MANAGER_SUB,
  DEPARTURE_INFO,
  LOC_INFO,
  ...buildContainerQtyColumnDefs(containers),
];

export const MAIN_COLUMN_DEFS = buildMainColumnDefs();
export const SUB01_COLUMN_DEFS = buildSub01ColumnDefs();
export const SUB02_COLUMN_DEFS = buildSub02ColumnDefs();
