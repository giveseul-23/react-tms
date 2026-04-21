import { makeAuditColumns } from "@/app/components/grid/commonColumns";

// 메인 그리드
export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_DSPCH_NO", field: "DSPCH_NO" },
  { headerName: "LBL_SETL_DOC_NO", field: "SETL_DOC_NO" },
  { headerName: "LBL_SETL_PRG_STS", field: "SETL_PRG_STS", codeKey: "setlPrgSts" },
  { headerName: "LBL_DLV_REQ_DT", field: "DLV_REQ_DT" },
  { headerName: "LBL_PAY_TPCO_CD", field: "PAY_TPCO_CD" },
  { headerName: "LBL_PAY_TPCO_NM", field: "PAY_TPCO_NM" },
  { headerName: "LBL_DL_CLOSE_STS", field: "DL_CLOSE_STS", codeKey: "dlCloseSts" },
  { headerName: "LBL_TOT_CALC_AMT", field: "TOT_CALC_AMT", type: "numeric" },
  { headerName: "LBL_TOT_CNFM_AMT", field: "TOT_CNFM_AMT", type: "numeric" },
  { headerName: "LBL_DPT_LOC", field: "DPT_LOC" },
  { headerName: "LBL_ARRV_LOC", field: "ARRV_LOC" },
  { headerName: "LBL_TPCO_NM", field: "TPCO_NM" },
  ...makeAuditColumns({
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// 비용상세정보 (좌측)
export const COST_DETAIL_COLUMN_DEFS = [
  { headerName: "LBL_CTRT_ITEM_CD", field: "CTRT_ITEM_CD" },
  { headerName: "LBL_CTRT_ITEM_NM", field: "CTRT_ITEM_NM" },
  { headerName: "LBL_CALC_AMT", field: "CALC_AMT", type: "numeric" },
  { headerName: "LBL_OPR_CNFM_AMT", field: "OPR_CNFM_AMT", type: "numeric" },
  { headerName: "LBL_OPR_ADJ_REASON", field: "OPR_ADJ_REASON" },
  { headerName: "LBL_DOC_CNT", field: "DOC_CNT", type: "numeric" },
  { headerName: "LBL_FARE_CALC_TP", field: "FARE_CALC_TP" },
  { headerName: "LBL_DSPCH_NO", field: "DSPCH_NO" },
];

// 비용상세정보 (우측) — 함수
export const COST_FUNCTION_COLUMN_DEFS = [
  { headerName: "LBL_COST_CD", field: "COST_CD" },
  { headerName: "LBL_COST_CD_NM", field: "COST_CD_NM" },
  { headerName: "LBL_CALC_FN_CD", field: "CALC_FN_CD" },
  { headerName: "LBL_CALC_FN_NM", field: "CALC_FN_NM" },
  { headerName: "LBL_FN_SRC_VAL", field: "FN_SRC_VAL" },
  { headerName: "LBL_FN_ADJ_VAL", field: "FN_ADJ_VAL" },
  { headerName: "LBL_COND_FN_NM", field: "COND_FN_NM" },
];

// 경유처
export const WAYPOINT_COLUMN_DEFS = [
  { headerName: "LBL_DSPCH_NO", field: "DSPCH_NO" },
  { headerName: "LBL_LOC_ID", field: "LOC_ID" },
  { headerName: "LBL_LOC_NM", field: "LOC_NM" },
  { headerName: "LBL_LOC_GUBUN", field: "LOC_GUBUN", codeKey: "locGubun" },
  { headerName: "LBL_DIRECT_DIST", field: "DIRECT_DIST", type: "numeric" },
  { headerName: "LBL_ADJ_DIRECT_DIST", field: "ADJ_DIRECT_DIST", type: "numeric" },
  { headerName: "LBL_PREV_MOVE_DIST", field: "PREV_MOVE_DIST", type: "numeric" },
  { headerName: "LBL_ADJ_PREV_MOVE_DIST", field: "ADJ_PREV_MOVE_DIST", type: "numeric" },
  { headerName: "LBL_DIST_CHG_RSN", field: "DIST_CHG_RSN" },
  { headerName: "LBL_SIDO", field: "SIDO" },
  { headerName: "LBL_SIGUNGU", field: "SIGUNGU" },
];

// 증빙문서
export const EVIDENCE_COLUMN_DEFS = [
  { headerName: "LBL_ITEM_CD", field: "ITEM_CD" },
  { headerName: "LBL_ITEM_NM", field: "ITEM_NM" },
  { headerName: "LBL_FILE_ID", field: "FILE_ID" },
  { headerName: "LBL_FILE_NM", field: "FILE_NM" },
  { headerName: "LBL_EXTENSION", field: "EXTENSION" },
  ...makeAuditColumns({
    delete: true,
    insertPerson: true,
  }),
];
