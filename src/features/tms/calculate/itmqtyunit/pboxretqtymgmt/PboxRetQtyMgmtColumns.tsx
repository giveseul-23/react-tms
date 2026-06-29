// 그리드 컬럼 정의 (서버 PboxRetQtyMgmtMainGrid/Sub01/Sub02 기준)
// audit 컬럼(등록자/등록일시/수정자/수정일시)은 DataGrid 가 자동 추가(model.bind).

// 물동량처리상태가 신규(1010)일 때만 편집 허용 (서버 sub02 beforeedit 대응)
const editableWhenNew = (p: any) => p?.data?.ITEMQTY_OP_STS === "1010";

// 회수율 % 표기
const pctFormatter = (p: any) => {
  const n = Number(String(p?.value ?? "").replace(/,/g, "")) || 0;
  return `${(n > 0 ? n : 0).toFixed(1)}%`;
};

// ── 메인: 협력사단위 (읽기전용 + 합계행) ───────────────────────────
export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_CARRIER_CODE", field: "CARR_CD", align: "center", width: 150 },
  { type: "text", headerName: "LBL_CARRIER_NAME", field: "CARR_NM", width: 150 },
  { type: "numeric", headerName: "LBL_OUT_PBOX_QTY_ORI", field: "TTL_OUT_PBOX_QTY_ORI", summable: true, width: 120 },
  { type: "numeric", headerName: "LBL_OUT_PBOX_QTY", field: "TTL_OUT_PBOX_QTY", summable: true, width: 120 },
  { type: "numeric", headerName: "LBL_IN_PBOX_QTY", field: "TTL_IN_PBOX_QTY", summable: true, width: 120 },
  { type: "numeric", headerName: "LBL_COLLECT_RATIO", field: "RCVRY_PBOX_RT", width: 100, valueFormatter: pctFormatter },
  { type: "numeric", headerName: "LBL_ADD_RECOVERY_QTY", field: "ADD_RCVRY_QTY", summable: true, width: 120 },
];

// ── sub01: 차량단위요약 (읽기전용 + 합계행) ─────────────────────────
export const SUB01_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_CARRIER_CODE", field: "CARR_CD", align: "center", width: 150 },
  { type: "text", headerName: "LBL_CARRIER_NAME", field: "CARR_NM", width: 150 },
  { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO", align: "center" },
  { type: "text", headerName: "LBL_VEHICLE_TYPE", field: "VEH_TP_CD", align: "center", width: 100 },
  { type: "text", headerName: "LBL_VEHICLE_TYPE_NAME", field: "VEH_TP_NM", align: "center", width: 100 },
  { type: "text", headerName: "LBL_DRIVER_NAME", field: "DRVR_NM", align: "center", width: 60 },
  { type: "combo", headerName: "LBL_ITM_QTY_OP_STS", field: "ITEMQTY_OP_STS", codeKey: "itmqtyOpSts", align: "center", width: 120 },
  { type: "numeric", headerName: "LBL_OUT_PBOX_QTY_ORI", field: "TTL_OUT_PBOX_QTY_ORI", summable: true, width: 120 },
  { type: "numeric", headerName: "LBL_OUT_PBOX_QTY", field: "TTL_OUT_PBOX_QTY", summable: true, width: 120 },
  { type: "numeric", headerName: "LBL_IN_PBOX_QTY", field: "TTL_IN_PBOX_QTY", summable: true, width: 120 },
  { type: "numeric", headerName: "LBL_BASE_PERIOD_RCVRY_QTY", field: "TTL_BASE_PRD_IN_BOX_QTY", summable: true, width: 180 },
  { type: "numeric", headerName: "LBL_FOCUS_PERIOD_RCVRY_QTY", field: "TTL_FOCUS_PRD_IN_BOX_QTY", summable: true, width: 180 },
  { type: "numeric", headerName: "LBL_COLLECT_RATIO", field: "RCVRY_PBOX_RT", width: 100, valueFormatter: pctFormatter },
  { type: "numeric", headerName: "LBL_ADD_RECOVERY_QTY", field: "ADD_IN_BOX_QTY", summable: true, width: 120 },
  { type: "numeric", headerName: "LBL_PLT_RCVRY_QTY", field: "TTL_IN_PLT_QTY", summable: true, width: 120 },
];

// ── sub02: 상세 (신규 상태만 편집) ─────────────────────────────────
export const SUB02_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "combo", headerName: "LBL_TERM_TP", field: "TERM_TP", codeKey: "pboxTermTp", align: "center", editable: editableWhenNew },
  { type: "text", headerName: "LBL_DLVRY_DATE", field: "DLVRY_DT", align: "center", width: 90 },
  { type: "text", headerName: "LBL_CARRIER_CODE", field: "CARR_CD", align: "center", width: 150 },
  { type: "text", headerName: "LBL_CARRIER_NAME", field: "CARR_NM", width: 150 },
  { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO", align: "center" },
  { type: "text", headerName: "LBL_VEHICLE_TYPE", field: "VEH_TP_CD", align: "center", width: 100 },
  { type: "text", headerName: "LBL_VEHICLE_TYPE_NAME", field: "VEH_TP_NM", align: "center", width: 100 },
  { type: "text", headerName: "LBL_DRIVER_NAME", field: "DRVR_NM", align: "center", width: 60 },
  { type: "combo", headerName: "LBL_ITM_QTY_OP_STS", field: "ITEMQTY_OP_STS", codeKey: "itmqtyOpSts", align: "center", width: 120 },
  { type: "numeric", headerName: "LBL_OUT_PBOX_QTY_ORI", field: "OTBND_PBOX_QTY_ORI", summable: true, width: 120 },
  {
    type: "numeric",
    headerName: "LBL_OUT_PBOX_QTY",
    field: "OTBND_PBOX_QTY",
    editable: editableWhenNew,
    validators: { min: 1 },
    summable: true,
    width: 120,
  },
  { type: "numeric", headerName: "LBL_IN_PBOX_QTY", field: "INBND_PBOX_QTY", summable: true, width: 120 },
  { type: "numeric", headerName: "LBL_ADD_RECOVERY_QTY", field: "ADD_IN_BOX_QTY", summable: true, width: 120 },
  { type: "numeric", headerName: "LBL_PLT_RCVRY_QTY", field: "INBND_PLT_QTY", editable: editableWhenNew, width: 120 },
  { type: "text", headerName: "LBL_RET_PBOX_MEMO", field: "MEMO_DESC", editable: editableWhenNew, width: 200 },
];
