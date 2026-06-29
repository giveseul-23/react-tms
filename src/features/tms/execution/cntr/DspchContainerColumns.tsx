// 그리드 컬럼 정의 (서버 DspchContainerMain / DspchContainerSub01 기준)
// audit 컬럼(등록자/등록일시/수정자/수정일시)은 DataGrid 가 자동 추가(model.bind) — 서버 audit 컬럼 OMIT.

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
    statusStyle: "DSPCH_OP_STS",
    width: 80,
    editable: false,
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
