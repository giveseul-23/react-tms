// 그리드 컬럼 정의 (서버 PodReportMainGrid / SubGrid01~03 기준)
// audit 컬럼(등록자/등록일시/수정자/수정일시/상태)은 OMIT (조회 화면).

// ── 메인: 인수증(POD) — 읽기전용 ───────────────────────────────────
export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_POD_NO", field: "POD_ID", align: "center", width: 100 },
  { type: "combo", headerName: "LBL_POD_TCD", field: "POD_TCD", codeKey: "podTcd", align: "center", width: 150 },
  { type: "combo", headerName: "LBL_POD_OP_STS", field: "POD_OP_STS", codeKey: "podOpSts", align: "center", width: 100 },
  { type: "datetime", headerName: "LBL_POD_SIGN_DTTM", field: "POD_RPT_DTTM", align: "center", width: 130 },
  { type: "numeric", headerName: "LBL_REG_IMG_CNT", field: "POD_IMG_REG_CNT", align: "right", width: 100 },
  { type: "combo", headerName: "LBL_POD_DELV_CNFM_TP", field: "POD_DELV_CNFM_TP", codeKey: "podDelvCnfmTp", align: "center", width: 100, editable: true },
  { type: "text", headerName: "LBL_CARRIER_CODE", field: "CARR_CD", align: "center", width: 100 },
  { type: "combo", headerName: "LBL_ITM_TAKEOVER_SCD", field: "ITM_TKOVR_SCD", codeKey: "itmTkovrScd", align: "center", width: 100 },
  { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO", align: "center", width: 100 },
  { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO", align: "center", width: 100, editable: true },
  { type: "text", headerName: "LBL_VEH_TP_NM", field: "VEH_TP_NM", align: "center", width: 100, editable: true },
  { type: "text", headerName: "LBL_DRVR_NM", field: "DRVR_NM", width: 100 },
  { type: "text", headerName: "LBL_DESTINATION_CD", field: "TO_LOC_CD", align: "center", width: 150 },
  { type: "text", headerName: "LBL_DESTINATION_NM", field: "TO_LOC_NM", align: "left", width: 150 },
  { type: "text", headerName: "LBL_CUSTOMER_ORDER_NO", field: "CUST_ORD_NO", align: "center", width: 150 },
  { type: "text", headerName: "LBL_ORDER_NO", field: "SHPM_NO", width: 150 },
  { type: "text", headerName: "LBL_PAY_CARRIER_CODE", field: "PAY_CARR_CD", align: "center", width: 150 },
  { type: "text", headerName: "LBL_PAY_CARRIER_NAME", field: "PAY_CARR_NM", width: 150 },
];

// ── sub01: 인수상품정보 — 읽기전용 ─────────────────────────────────
export const SUB01_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_POD_DTL_ID", field: "POD_DTL_ID", align: "center", width: 150 },
  { type: "text", headerName: "LBL_DESTINATION_NM", field: "LOC_NM", align: "left", width: 150 },
  { type: "text", headerName: "LBL_ORDER_NO", field: "ORD_NO", align: "center", width: 150 },
  { type: "text", headerName: "LBL_CUSTOMER_ORDER_NO", field: "CUST_ORD_NO", align: "center", width: 150 },
  { type: "text", headerName: "LBL_ITEM_CD", field: "CUST_ITEM_CD", align: "center", width: 100 },
  { type: "text", headerName: "LBL_ITEM_NM", field: "CUST_ITEM_NM", align: "left", width: 150 },
  { type: "numeric", headerName: "LBL_PLAN_QTY", field: "PLN_QTY", align: "right", width: 100 },
  { type: "numeric", headerName: "LBL_DELIVERY_QUANTITY", field: "CFM_QTY", align: "right", width: 80 },
  { type: "numeric", headerName: "LBL_DELIVERY_WEIGHT", field: "CFM_WGT", align: "right", width: 100 },
  { type: "numeric", headerName: "LBL_REJECT_OR_RETURN_QUANTITY", field: "ITEM_TKOVR_RJCT_QTY", align: "right", width: 140 },
  { type: "text", headerName: "LBL_UOM", field: "CFM_QTY_UOM", align: "center", width: 80 },
  { type: "text", headerName: "POD_ID", field: "CARR_CD", width: 150, hide: true, noLang: true },
  { type: "text", headerName: "SHIPMENT_ID", field: "SHPM_ID", width: 150, hide: true, noLang: true },
  { type: "text", headerName: "SHIPMENT_DTL_ID", field: "SHPM_DTL_ID", width: 150, hide: true, noLang: true },
];

// ── sub02: 거절·반품 (셀 편집 + 행추가/저장) ──────────────────────
export const SUB02_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_POD_DTL_ID", field: "POD_DTL_ID", align: "center", width: 100 },
  {
    type: "combo",
    headerName: "LBL_ITM_REJECT_REASON",
    field: "ITEM_TKOVR_RJCT_RSN_CD",
    codeKey: "itmTkovrRjctRsnCd",
    align: "center",
    width: 150,
    required: true,
    insertable: true,
    editable: true,
  },
  {
    type: "text",
    headerName: "LBL_ITM_REJECT_REASON_DESC",
    field: "ITEM_TKOVR_RJCT_RSN_DESC",
    align: "left",
    width: 300,
    insertable: true,
    editable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_REJECT_OR_RETURN_QUANTITY",
    field: "ITEM_TKOVR_RJCT_QTY",
    align: "right",
    width: 150,
    required: true,
    insertable: true,
    editable: true,
  },
];

// ── sub03: POD 이미지 파일 목록 — 읽기전용 ─────────────────────────
export const SUB03_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "POD_ID", field: "POD_ID", width: 150, hide: true, noLang: true },
  { type: "text", headerName: "LBL_FILE_ID", field: "FILE_ID", align: "center", width: 150 },
  { type: "combo", headerName: "LBL_IMG_OP_TCD", field: "IMG_OP_TCD", codeKey: "imgOpTcd", align: "center", width: 150 },
  { type: "text", headerName: "LBL_ORG_FILE_NM", field: "ORG_FILE_NM", width: 350 },
];
