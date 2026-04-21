import { makeAuditColumns } from "@/app/components/grid/commonColumns";

// 메인 그리드
export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_AP_SETL_ID", field: "AP_SETL_ID" },
  { headerName: "LBL_AP_SETL_GRP_ID", field: "AP_SETL_GRP_ID" },
  { headerName: "LBL_OP_STATUS", field: "AP_FI_STS_NM" },
  { headerName: "LBL_PAY_CARRIER_CODE", field: "PAY_CARR_CD" },
  { headerName: "LBL_PAY_CARRIER_NAME", field: "CARR_NM" },
  { headerName: "LBL_AP_FROM_DATE", field: "FRM_DTTM" },
  { headerName: "LBL_AP_END_DATE", field: "TO_DTTM" },
  { headerName: "LBL_VOS_RATE", field: "VOS_RATE" },
  { headerName: "LBL_VAT_RATE", field: "VAT_RATE" },
  { headerName: "LBL_TTL_RATE", field: "TTL_RATE" },
  { headerName: "LBL_REMARK", field: "RMRK" },
  { headerName: "LBL_FI_TAX_CD", field: "TAX_NM" },
  { headerName: "LBL_TARGET_SYS", field: "TARGET_SYS" },
  { headerName: "LBL_CST_DIST_YN", field: "CST_DIST_YN" },
  {
    headerName: "LBL_CST_DIST_STS",
    field: "CST_DIST_STS",
    codeKey: "cstDistSts",
  },
  { headerName: "LBL_FI_YR", field: "FI_YR" },
  { headerName: "LBL_DOC_NO", field: "DOC_NO" },
  { headerName: "LBL_RVS_FI_YR", field: "RVS_FI_YR" },
  { headerName: "LBL_RVS_DOC_NO", field: "RVS_DOC_NO" },
  { headerName: "LBL_INV_YR", field: "INV_YR" },
  { headerName: "LBL_INV_NO", field: "INV_NO" },
  { headerName: "LBL_RVS_INV_YR", field: "RVS_INV_YR" },
  { headerName: "LBL_RVS_INV_NO", field: "RVS_INV_NO" },
  { headerName: "LBL_POSTING_DT", field: "POSTING_DT" },
  { headerName: "LBL_RES_CD", field: "RESPONSE_CODE" },
  { headerName: "LBL_RES_MSG", field: "RESPONSE_MSG" },
  ...makeAuditColumns({
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// 종합내역 - 좌측 (요약)
export const SUMMARY_COLUMN_DEFS = [
  { headerName: "No" },
  {
    headerName: "LBL_AP_DETAIL_TYPE",
    field: "AP_SETL_DTL_TCD",
    codeKey: "apSetlDetailType",
  },
  { headerName: "LBL_APPLIED_VAL", field: "APPLD_VAL" },
  { headerName: "LBL_DESC", field: "APPLD_VAL_TCD", codeKey: "apSetlDescType" },
  { headerName: "LBL_RATE", field: "RATE" },
];

// 종합내역 - 월대운임상세내역
export const MONTHLY_FARE_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_CARR_NM", field: "CARR_NM" },
  { headerName: "LBL_VEHICLE_TYPE", field: "VEH_TP_NM" },
  { headerName: "LBL_CAR_CNT", field: "VEH_CNT" },
  { headerName: "LBL_SUM_TOTAL", field: "TTL_RATE" },
];

// 종합내역 - 용차/배차지급내역
export const HIRE_DISPATCH_PAY_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_CARR_NM", field: "CARR_NM" },
  { headerName: "LBL_VEHICLE_TYPE", field: "VEH_TP_NM" },
  { headerName: "LBL_DSPCH_CNT", field: "VEH_CNT" },
  { headerName: "LBL_SUM_TOTAL", field: "TTL_RATE" },
];

// 종합내역 - 물동지급내역
export const FREIGHT_PAY_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_OPER_TCD", field: "CHG_CD" },
  { headerName: "LBL_OPER_TNM", field: "CHG_NM" },
  { headerName: "LBL_RATE", field: "RATE" },
  ...makeAuditColumns({
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// 종합내역 - 간접비지급내역
export const INDIRECT_PAY_COLUMN_DEFS = [
  { headerName: "LBL_RATE_ITEM_CODE", field: "CHG_CD" },
  { headerName: "LBL_OPER_TNM", field: "CHG_NM" },
  { headerName: "LBL_RATE", field: "RATE" },
  { headerName: "LBL_UNIT_COST", field: "UNIT_RATE" },
  { headerName: "LBL_APPLIED_VAL", field: "APPLD_VAL" },
  { headerName: "LBL_REASON", field: "RSN_DESC" },
  ...makeAuditColumns({
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// 코스트센터/계정별내역
export const COST_CENTER_COLUMN_DEFS = [
  { headerName: "LBL_OP_STATUS", field: "AP_FI_STS", codeKey: "fiSts" },
  { headerName: "LBL_CST_CNTR_CD", field: "CST_CNTR_CD", codeKey: "cstCntrCd" },
  { headerName: "LBL_GL_ACCOUNT_CD", field: "GL_LDGR_CD" },
  { headerName: "LBL_GL_ACCOUNT_NM", field: "GL_LDGR_NM" },
  { headerName: "LBL_PLANNED_AMOUNT", field: "PLN_RATE" },
  { headerName: "LBL_CONFIRM_COST", field: "CFM_RATE" },
  { headerName: "LBL_APPROVAL_RATE", field: "APRVL_RATE" },
  { headerName: "LBL_DIFF_RATE", field: "DIFF_RATE" },
  {
    headerName: "LBL_CREATION_TP",
    field: "CST_CNTR_GL_RC_TCD",
    codeKey: "costCenter",
  },
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
  { headerName: "No" },
  { headerName: "LBL_ITEM_CD", field: "ITEM_CD" },
  { headerName: "LBL_ITEM_NM", field: "ITEM_NM" },
  { headerName: "LBL_PLANT_CD", field: "PLANT_CD" },
  { headerName: "LBL_BATCH_CD", field: "PAS_NO" },
  { headerName: "LBL_RATE", field: "RATE" },
  { headerName: "LBL_QTY", field: "QTY" },
  { headerName: "LBL_UOM", field: "QTY_UOM" },
  { headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO" },
  ...makeAuditColumns({
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// 증빙문서
export const EVIDENCE_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_AP_SETL_ID", field: "AP_SETL_ID" },
  { headerName: "LBL_FILE_ID", field: "FILE_ID" },
  { headerName: "LBL_ORG_FILE_NM", field: "ORG_FILE_NM" },
  { headerName: "LBL_FILE_EXTENSION", field: "FILE_NM_EXTENSION" },
  ...makeAuditColumns({
    delete: true,
    insertPerson: true,
    insertDate: true,
  }),
];
