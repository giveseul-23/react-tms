// 메인 그리드
export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_SETL_DOC_NO", field: "SETL_DOC_NO" },
  { headerName: "LBL_SETL_PRG_STS", field: "SETL_PRG_STS", codeKey: "setlPrgSts" },
  { headerName: "LBL_COST_CHECK", field: "COST_CHECK", codeKey: "costCheck" },
  { headerName: "LBL_DSPCH_NO", field: "DSPCH_NO" },
  { headerName: "LBL_PAY_TPCO_CD", field: "PAY_TPCO_CD" },
  { headerName: "LBL_PAY_TPCO_NM", field: "PAY_TPCO_NM" },
  { headerName: "LBL_CALC_AMT", field: "CALC_AMT", type: "numeric" },
  { headerName: "LBL_OPR_CNFM_AMT", field: "OPR_CNFM_AMT", type: "numeric" },
  { headerName: "LBL_MGR_CNFM_AMT", field: "MGR_CNFM_AMT", type: "numeric" },
  { headerName: "LBL_CUR", field: "CUR" },
  { headerName: "LBL_VEH_NO", field: "VEH_NO" },
  { headerName: "LBL_TPCO_CD", field: "TPCO_CD" },
  { headerName: "LBL_TPCO_NM", field: "TPCO_NM" },
];

// 비용상세정보
export const COST_DETAIL_COLUMN_DEFS = [
  { headerName: "LBL_DSPCH_NO", field: "DSPCH_NO" },
  { headerName: "LBL_CTRT_ITEM_CD", field: "CTRT_ITEM_CD" },
  { headerName: "LBL_CTRT_ITEM_NM", field: "CTRT_ITEM_NM" },
  { headerName: "LBL_CALC_AMT", field: "CALC_AMT", type: "numeric" },
  { headerName: "LBL_OPR_CNFM_AMT", field: "OPR_CNFM_AMT", type: "numeric" },
  { headerName: "LBL_MGR_CNFM_AMT", field: "MGR_CNFM_AMT", type: "numeric" },
  { headerName: "LBL_OPR_ADJ_REASON", field: "OPR_ADJ_REASON" },
  { headerName: "LBL_MGR_ADJ_REASON", field: "MGR_ADJ_REASON" },
  { headerName: "LBL_OPR_CNFM_ID", field: "OPR_CNFM_ID" },
];

// 경유처
export const WAYPOINT_COLUMN_DEFS = [
  { headerName: "LBL_DSPCH_NO", field: "DSPCH_NO" },
  { headerName: "LBL_LOC_ID", field: "LOC_ID" },
  { headerName: "LBL_LOC_NM", field: "LOC_NM" },
  { headerName: "LBL_LOC_GUBUN", field: "LOC_GUBUN" },
  { headerName: "LBL_AREA_CD", field: "AREA_CD" },
  { headerName: "LBL_AREA_NM", field: "AREA_NM" },
  { headerName: "LBL_SIDO", field: "SIDO" },
  { headerName: "LBL_SIGUNGU", field: "SIGUNGU" },
  { headerName: "LBL_DETAIL_ADDR", field: "DETAIL_ADDR" },
  { headerName: "LBL_LATITUDE", field: "LATITUDE", type: "numeric" },
  { headerName: "LBL_LONGITUDE", field: "LONGITUDE", type: "numeric" },
  { headerName: "LBL_ZIP_CODE", field: "ZIP_CODE" },
];
