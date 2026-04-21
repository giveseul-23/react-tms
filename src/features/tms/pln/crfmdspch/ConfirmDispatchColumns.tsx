// 메인 그리드
export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_ASSIGN_STS", field: "ASSIGN_STS", codeKey: "assignSts" },
  { headerName: "LBL_DLV_REQ_DT", field: "DLV_REQ_DT" },
  { headerName: "LBL_DSPCH_NO", field: "DSPCH_NO" },
  {
    headerName: "LBL_DSPCH_PRG_STS",
    field: "DSPCH_PRG_STS",
    codeKey: "dspchPrgSts",
  },
  { headerName: "LBL_TPCO_NM", field: "TPCO_NM" },
  { headerName: "LBL_VEH_NO", field: "VEH_NO" },
  { headerName: "LBL_ORD_TP", field: "ORD_TP", codeKey: "ordTp" },
  { headerName: "LBL_VEH_OP_TP", field: "VEH_OP_TP", codeKey: "vehOpTp" },
  {
    headerName: "LBL_RCPT_ISSUE_STS",
    field: "RCPT_ISSUE_STS",
    codeKey: "rcptIssueSts",
  },
  { headerName: "LBL_ISSUE_CNT", field: "ISSUE_CNT", type: "numeric" },
  {
    headerName: "LBL_RCPT_ISSUE_TP",
    field: "RCPT_ISSUE_TP",
    codeKey: "rcptIssueTp",
  },
  { headerName: "LBL_WAYPOINT_CNT", field: "WAYPOINT_CNT", type: "numeric" },
  { headerName: "LBL_ROUTE", field: "ROUTE" },
];

// 주문정보 - 좌측
export const ORDER_COLUMN_DEFS = [
  { headerName: "LBL_ASSIGN_STS", field: "ASSIGN_STS", codeKey: "assignSts" },
  { headerName: "LBL_IMS", field: "IMS" },
  { headerName: "LBL_ORD_NO", field: "ORD_NO" },
  { headerName: "LBL_DPT_LOC_CD", field: "DPT_LOC_CD" },
  { headerName: "LBL_DPT_LOC_NM", field: "DPT_LOC_NM" },
  { headerName: "LBL_ARRV_LOC_CD", field: "ARRV_LOC_CD" },
  { headerName: "LBL_ARRV_LOC_NM", field: "ARRV_LOC_NM" },
  { headerName: "LBL_PLAN_DIST", field: "PLAN_DIST", type: "numeric" },
];

// 주문정보 - 우측 (품목)
export const ORDER_ITEM_COLUMN_DEFS = [
  { headerName: "LBL_ITEM_CD", field: "ITEM_CD" },
  { headerName: "LBL_ITEM_NM", field: "ITEM_NM" },
  { headerName: "LBL_PLAN_ORD_QTY", field: "PLAN_ORD_QTY", type: "numeric" },
  { headerName: "LBL_CNFM_ORD_QTY", field: "CNFM_ORD_QTY", type: "numeric" },
  { headerName: "LBL_PLAN_ORD_UOM", field: "PLAN_ORD_UOM" },
  { headerName: "LBL_PLAN_NET_VOL", field: "PLAN_NET_VOL", type: "numeric" },
  { headerName: "LBL_CNFM_NET_VOL", field: "CNFM_NET_VOL", type: "numeric" },
];

// 인수증
export const RECEIPT_COLUMN_DEFS = [
  { headerName: "LBL_RCPT_NO", field: "RCPT_NO" },
  { headerName: "LBL_REISSUE_CNT", field: "REISSUE_CNT", type: "numeric" },
  {
    headerName: "LBL_RCPT_ISSUE_STS",
    field: "RCPT_ISSUE_STS",
    codeKey: "rcptIssueSts",
  },
  {
    headerName: "LBL_RCPT_ISSUE_TP",
    field: "RCPT_ISSUE_TP",
    codeKey: "rcptIssueTp",
  },
  { headerName: "LBL_RCPT_ISSUE_ID", field: "RCPT_ISSUE_ID" },
  { headerName: "LBL_RCPT_ISSUE_DTTM", field: "RCPT_ISSUE_DTTM" },
];

// 인수증 발행이력
export const RECEIPT_HISTORY_COLUMN_DEFS = [
  { headerName: "LBL_RCPT_NO", field: "RCPT_NO" },
  {
    headerName: "LBL_RCPT_ISSUE_TP",
    field: "RCPT_ISSUE_TP",
    codeKey: "rcptIssueTp",
  },
  { headerName: "LBL_RCPT_LOG_EVT_CD", field: "RCPT_LOG_EVT_CD" },
  { headerName: "LBL_INS_USR_ID", field: "INS_USR_ID" },
  { headerName: "LBL_INS_DTTM", field: "INS_DTTM" },
];
