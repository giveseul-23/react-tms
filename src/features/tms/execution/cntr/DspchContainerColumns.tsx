// 그리드 컬럼 정의 (서버 DspchContainerMain / DspchContainerSub01 기준)
// audit 컬럼(등록자/등록일시/수정자/수정일시)은 DataGrid 가 자동 추가(model.bind) — 서버 audit 컬럼 OMIT.

// 배차진행상태 색상 — 서버 ViewController.setDispatchOperationStatusColor 대응
const DSPCH_OP_STS_STYLE: Record<string, { backgroundColor: string; color?: string }> = {
  "2000": { backgroundColor: "#4D4D4D" },
  "2010": { backgroundColor: "#ffffff" },
  "2020": { backgroundColor: "#edeff4", color: "#000" },
  "2030": { backgroundColor: "#dbdfe8", color: "#000" },
  "2040": { backgroundColor: "#FFD85D", color: "#000" },
  "2050": { backgroundColor: "#b6bfd2", color: "#000" },
  "2060": { backgroundColor: "#FFD85D", color: "#000" },
  "2070": { backgroundColor: "#929fbb", color: "#fff" },
  "2073": { backgroundColor: "#8090b0", color: "#fff" },
  "2075": { backgroundColor: "#6d80a4", color: "#fff" },
  "2080": { backgroundColor: "#5b7099", color: "#fff" },
  "2090": { backgroundColor: "#49608d", color: "#fff" },
  "2100": { backgroundColor: "#375082", color: "#fff" },
  "2103": { backgroundColor: "#244077", color: "#fff" },
  "2105": { backgroundColor: "#12306b", color: "#fff" },
  "2110": { backgroundColor: "#002060", color: "#fff" },
  "2001": { backgroundColor: "#000000", color: "#fff" },
};

const dspchOpStsCellStyle = (p: any) => {
  const code = String(parseInt(p?.data?.DSPCH_OP_STS, 10));
  const color = DSPCH_OP_STS_STYLE[code];
  return { textAlign: "center", fontWeight: "bold", ...(color ?? {}) };
};

// ── 메인: 착지단위 배차 (읽기전용) ──────────────────────────────────
export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  // 운송요청일
  { type: "date", headerName: "LBL_REQUESTED_DELIVERY_DATE", field: "DLVRY_DT", align: "center", width: 100, editable: false },
  // 배차번호
  { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO", align: "center", width: 80, editable: false },
  // 배차진행상태 (색상 표시)
  {
    type: "combo",
    headerName: "LBL_DISPATCH_OPERATIONAL_STATUS",
    field: "DSPCH_OP_STS",
    codeKey: "dspchOpSts",
    width: 80,
    editable: false,
    cellStyle: dspchOpStsCellStyle,
  },
  // 착지구분
  { type: "combo", headerName: "LBL_PICKDROP_DIV", field: "STOP_TP", codeKey: "stopTp", align: "center", editable: false },
  // 차량번호
  { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO", align: "center", editable: false },
  // 운전자명
  { type: "text", headerName: "LBL_DRIVER_NAME", field: "DRVR_NM", align: "left", editable: false },
  // 착지코드
  { type: "text", headerName: "LBL_LOCATION_CODE", field: "LOC_CD", align: "center", width: 120, editable: false },
  // 착지명
  { type: "text", headerName: "LBL_LOCATION_NAME", field: "LOC_NM", align: "left", width: 140, editable: false },
];

// ── sub01: 운송단위 입출고 수량 (입고/출고 수량만 편집) ──────────────
export const SUB01_COLUMN_DEFS = [
  { headerName: "No" },
  // 운송단위
  {
    type: "combo",
    headerName: "LBL_TRANSPORT_UNIT",
    field: "CNTR_CD",
    codeKey: "cntrCd",
    valueGetter: (params: any) => params.data?.CNTR_CD || params.data?.CNTR_TCD,
    align: "center",
    width: 140,
    editable: false,
  },
  // 입고수량
  {
    type: "numeric",
    headerName: "LBL_INBOUND_COUNT",
    field: "DLVRY_QTY",
    align: "right",
    editable: true,
    required: true,
    validators: { required: true, min: 0 },
  },
  // 출고수량
  {
    type: "numeric",
    headerName: "LBL_OUTBOUND_COUNT",
    field: "RTRN_QTY",
    align: "right",
    editable: true,
    required: true,
    validators: { required: true, min: 0 },
  },
];
