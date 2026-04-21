import { makeAuditColumns } from "@/app/components/grid/commonColumns";

// 메인 그리드
export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_CLOSE_ID", field: "CLOSE_ID" },
  { headerName: "LBL_AP_SETL_CLOSE_GRP_ID", field: "AP_SETL_CLOSE_GRP_ID" },
  { headerName: "LBL_PRG_STS", field: "PRG_STS", codeKey: "prgSts" },
  { headerName: "LBL_PAY_TPCO_CD", field: "PAY_TPCO_CD" },
  { headerName: "LBL_PAY_TPCO_NM", field: "PAY_TPCO_NM" },
  { headerName: "LBL_SETL_FROM_DT", field: "SETL_FROM_DT" },
  { headerName: "LBL_SETL_TO_DT", field: "SETL_TO_DT" },
  { headerName: "LBL_SUPPLY_AMT", field: "SUPPLY_AMT", type: "numeric" },
  { headerName: "LBL_VAT_AMT", field: "VAT_AMT", type: "numeric" },
  { headerName: "LBL_PAY_TOT_AMT", field: "PAY_TOT_AMT", type: "numeric" },
  { headerName: "LBL_REMARK", field: "REMARK" },
  { headerName: "LBL_FI_TAX_CD", field: "FI_TAX_CD" },
  { headerName: "LBL_COST_SND_SYS", field: "COST_SND_SYS" },
];

// 종합내역 - 좌측 (요약)
export const SUMMARY_COLUMN_DEFS = [
  { headerName: "LBL_DETAIL_TP", field: "DETAIL_TP" },
  { headerName: "LBL_APPLY_VAL", field: "APPLY_VAL" },
  { headerName: "LBL_DESCRIPTION", field: "DESCRIPTION" },
  { headerName: "LBL_AMT", field: "AMT", type: "numeric" },
];

// 종합내역 - 월대운임상세내역
export const MONTHLY_FARE_COLUMN_DEFS = [
  { headerName: "LBL_TPCO_NM", field: "TPCO_NM" },
  { headerName: "LBL_VEH_TP", field: "VEH_TP" },
  { headerName: "LBL_VEH_CNT", field: "VEH_CNT", type: "numeric" },
  { headerName: "LBL_TOT_AMT", field: "TOT_AMT", type: "numeric" },
];

// 종합내역 - 용차/배차지급내역
export const HIRE_DISPATCH_PAY_COLUMN_DEFS = [
  { headerName: "LBL_TPCO_NM", field: "TPCO_NM" },
  { headerName: "LBL_VEH_TP", field: "VEH_TP" },
  { headerName: "LBL_DSPCH_CNT", field: "DSPCH_CNT", type: "numeric" },
  { headerName: "LBL_TOT_AMT", field: "TOT_AMT", type: "numeric" },
];

// 종합내역 - 물동지급내역
export const FREIGHT_PAY_COLUMN_DEFS = [
  { headerName: "LBL_ITEM_CD", field: "ITEM_CD" },
  { headerName: "LBL_ITEM_NM", field: "ITEM_NM" },
  { headerName: "LBL_AMT", field: "AMT", type: "numeric" },
  ...makeAuditColumns({
    insertDate: true,
    insertPerson: true,
    updateTime: true,
    updatePerson: true,
  }),
];

// 종합내역 - 간접비지급내역
export const INDIRECT_PAY_COLUMN_DEFS = [
  { headerName: "LBL_CTRT_ITEM_CD", field: "CTRT_ITEM_CD" },
  { headerName: "LBL_ITEM_NM", field: "ITEM_NM" },
  { headerName: "LBL_AMT", field: "AMT", type: "numeric" },
  { headerName: "LBL_UNIT_PRC", field: "UNIT_PRC", type: "numeric" },
  { headerName: "LBL_APPLY_VAL", field: "APPLY_VAL" },
  { headerName: "LBL_REASON", field: "REASON" },
  ...makeAuditColumns({
    insertDate: true,
    insertPerson: true,
    updateTime: true,
    updatePerson: true,
  }),
];

// 코스트센터/계정별내역
export const COST_CENTER_COLUMN_DEFS = [
  { headerName: "LBL_PRG_STS", field: "PRG_STS", codeKey: "prgSts" },
  { headerName: "LBL_COST_CENTER_CD", field: "COST_CENTER_CD" },
  { headerName: "LBL_GL_ACC_CD", field: "GL_ACC_CD" },
  { headerName: "LBL_GL_ACC_NM", field: "GL_ACC_NM" },
  { headerName: "LBL_PLAN_AMT", field: "PLAN_AMT", type: "numeric" },
  { headerName: "LBL_CONF_AMT", field: "CONF_AMT", type: "numeric" },
  { headerName: "LBL_APRV_AMT", field: "APRV_AMT", type: "numeric" },
  { headerName: "LBL_DIFF_AMT", field: "DIFF_AMT", type: "numeric" },
  { headerName: "LBL_CREAT_TP", field: "CREAT_TP", codeKey: "creatTp" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// 원재료비내역
export const MATERIAL_COST_COLUMN_DEFS = [
  { headerName: "LBL_ITEM_CD", field: "ITEM_CD" },
  { headerName: "LBL_ITEM_NM", field: "ITEM_NM" },
  { headerName: "LBL_PLANT_CD", field: "PLANT_CD" },
  { headerName: "LBL_BATCH_CD", field: "BATCH_CD" },
  { headerName: "LBL_AMT", field: "AMT", type: "numeric" },
  { headerName: "LBL_QTY", field: "QTY", type: "numeric" },
  { headerName: "LBL_UOM", field: "UOM" },
  { headerName: "LBL_DSPCH_NO", field: "DSPCH_NO" },
  ...makeAuditColumns({
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// 증빙문서
export const EVIDENCE_COLUMN_DEFS = [
  { headerName: "LBL_CLOSE_ID", field: "CLOSE_ID" },
  { headerName: "LBL_FILE_ID", field: "FILE_ID" },
  { headerName: "LBL_FILE_NM", field: "FILE_NM" },
  { headerName: "LBL_EXTENSION", field: "EXTENSION" },
  ...makeAuditColumns({
    delete: true,
    insertPerson: true,
    insertDate: true,
  }),
];
