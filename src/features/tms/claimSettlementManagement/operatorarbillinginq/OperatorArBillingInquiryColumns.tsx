import { makeAuditColumns } from "@/app/components/grid/commonColumns";
import { numberValueFormatter } from "@/app/components/grid/commonFormatters";

// 메인 정산 그리드
export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_AR_SETTLEMENT_DOC_NO", field: "AR_ID" },
  {
    headerName: "LBL_AR_PROGRESS_STATUS",
    field: "AR_FI_STS",
    codeKey: "arFiStatus",
  },
  { headerName: "LBL_AR_SALES_START_BASE_DATE", field: "AR_FRM_DT" },
  { headerName: "LBL_AR_SALES_END_BASE_DATE", field: "AR_TO_DT" },
  {
    headerName: "LBL_AR_SALES_CALC_TYPE_CD",
    field: "AR_CALC_TCD",
    codeKey: "arCalcTypeCode",
  },
  {
    headerName: "LBL_AR_TOTAL_CALC_AMT",
    field: "INS_COST",
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_AR_OPERATOR_CONFIRM_AMT",
    field: "ADJ_COST",
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_AR_APPROVAL_AMT",
    field: "CFM_COST",
    valueFormatter: numberValueFormatter,
  },
  { headerName: "LBL_AR_CUSTOMER_CD", field: "CUST_CD" },
  { headerName: "LBL_AR_CUSTOMER_NM", field: "CUST_NM" },
  { headerName: "LBL_AR_CUSTOMER_CONTRACT_CD", field: "CUST_CNTRCT_CD" },
  { headerName: "LBL_AR_CUSTOMER_CONTRACT_NM", field: "CUST_CNTRCT_NM" },
  { headerName: "LBL_AR_SALES_CONTRACT_CD", field: "AR_TRF_CD" },
  {
    headerName: "LBL_AR_SALES_CONTRACT_LEVEL_CD",
    field: "AR_TRF_LCD",
    codeKey: "arTariffLevelCode",
  },
  {
    headerName: "LBL_AR_SETTLEMENT_BASE_DATE_TP",
    field: "AR_STL_BASE_DT_TP",
    codeKey: "arBaseDateType",
  },
  { headerName: "LBL_AR_REF_SALES_SETTLEMENT_DOC_NO", field: "REF_AR_ID" },
  { headerName: "LBL_AR_REF_PURCHASE_SETTLEMENT_DOC_NO", field: "REF_AP_ID" },
  { headerName: "LBL_AR_SALES_CLOSE_ID", field: "AR_SETL_ID" },
  { headerName: "LBL_AR_CREATOR_REG_USER", field: "CRE_USR_ID" },
  { headerName: "LBL_AR_REG_DTTM", field: "CRE_DTTM" },
  { headerName: "LBL_AR_UPD_USER", field: "UPD_USR_ID" },
  { headerName: "LBL_AR_UPD_DTTM", field: "UPD_DTTM" },
];

// 청구항목
export const BILLING_ITEM_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_OPER_TCD", field: "AR_CHG_CD" },
  { headerName: "LBL_OPER_TNM", field: "AR_CHG_NM" },
  {
    headerName: "LBL_INS_COST",
    field: "INS_COST",
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_ADJ_COST",
    field: "ADJ_COST",
    valueFormatter: numberValueFormatter,
  },
  { headerName: "LBL_OP_ADJUST_REASON", field: "ADJ_RSN" },
  { headerName: "LBL_DOC_CNT", field: "FILE_CNT" },
  {
    headerName: "LBL_CHG_SIGN_TP",
    field: "CHG_SIGN_TP",
    codeKey: "chargeSignType",
  },
  { headerName: "LBL_GL_LDGR_CD", field: "GL_LDGR_CD" },
  {
    headerName: "MSG_AR_RESULT_MESSGE",
    field: "AR_CALC_RSLT_MSG_CD",
    codeKey: "arResultMessage",
  },
  { headerName: "LBL_AR_DTL_ID", field: "AR_DTL_ID" },
  { headerName: "LBL_AP_ID", field: "AR_ID" },
  ...makeAuditColumns({
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// 주문정보
export const ORDER_INFO_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_CUSTOMER_CODE", field: "CUST_CD" },
  { headerName: "LBL_CUSTOMER_NAME", field: "CUST_NM" },
  {
    headerName: "LBL_ACCOUNTS_RECEIVABLE_TARIFF_LEVEL_CODE",
    field: "AR_CNTRCT_LCD",
    codeKey: "arContractLevel",
  },
  { headerName: "LBL_CUSTOMER_CONTRACT_CODE", field: "CUST_CNTRCT_CD" },
  { headerName: "LBL_CUSTOMER_CONTRACT_NAME", field: "CUST_CNTRCT_NM" },
  { headerName: "LBL_SHIPMENT_ID", field: "SHPM_ID" },
  { headerName: "LBL_SHIPMENT_NO", field: "SHPM_NO" },
  { headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO" },
  { headerName: "LBL_ORDER_NO", field: "ORD_NO" },
  { headerName: "LBL_DEPARTURE_CODE", field: "FRM_LOC_CD" },
  { headerName: "LBL_DEPARTURE_NAME", field: "FRM_LOC_NM" },
  { headerName: "LBL_DESTINATION_CD", field: "TO_LOC_CD" },
  { headerName: "LBL_DESTINATION_NM", field: "TO_LOC_NM" },
  {
    headerName: "LBL_PLN_NET_VOL",
    field: "PLN_NET_VOL",
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_CFM_NET_VOL",
    field: "CFM_NET_VOL",
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_PLN_GRS_VOL",
    field: "PLN_GRS_VOL",
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_CFM_GRS_VOL",
    field: "CFM_GRS_VOL",
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_PLN_NET_WGT",
    field: "PLN_NET_WGT",
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_CFM_NET_WGT",
    field: "CFM_NET_WGT",
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_PLN_GRS_WGT",
    field: "PLN_GRS_WGT",
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_CFM_GRS_WGT",
    field: "CFM_GRS_WGT",
    valueFormatter: numberValueFormatter,
  },
  { headerName: "LBL_PLN_PLT_QTY", field: "PLN_PLT_QTY" },
  { headerName: "LBL_CFM_PLT_QTY", field: "CFM_PLT_QTY" },
  { headerName: "LBL_PLN_RTNR_QTY", field: "PLN_RTNR_QTY" },
  { headerName: "LBL_CFM_RTNR_QTY", field: "CFM_RTNR_QTY" },
  { headerName: "LBL_PLN_PBOX_QTY", field: "PLN_PBOX_QTY" },
  { headerName: "LBL_CFM_PBOX_QTY", field: "CFM_PBOX_QTY" },
  { headerName: "LBL_PLN_BOX_QTY", field: "PLN_BOX_QTY" },
  { headerName: "LBL_CFM_BOX_QTY", field: "CFM_BOX_QTY" },
  { headerName: "LBL_PLANNED_FLEX_QTY1", field: "PLN_FLEX_QTY1" },
  { headerName: "LBL_CONFIRMED_FLEX_QTY1", field: "CFM_FLEX_QTY1" },
  { headerName: "LBL_PLANNED_FLEX_QTY2", field: "PLN_FLEX_QTY2" },
  { headerName: "LBL_CONFIRMED_FLEX_QTY2", field: "CFM_FLEX_QTY2" },
  { headerName: "LBL_PLANNED_FLEX_QTY3", field: "PLN_FLEX_QTY3" },
  { headerName: "LBL_CONFIRMED_FLEX_QTY3", field: "CFM_FLEX_QTY3" },
  { headerName: "LBL_PLANNED_FLEX_QTY4", field: "PLN_FLEX_QTY4" },
  { headerName: "LBL_CONFIRMED_FLEX_QTY4", field: "CFM_FLEX_QTY4" },
  { headerName: "LBL_PLANNED_FLEX_QTY5", field: "PLN_FLEX_QTY5" },
  { headerName: "LBL_CONFIRMED_FLEX_QTY5", field: "CFM_FLEX_QTY5" },
];

// 증빙문서
export const ATTACHMENT_COLUMN_DEFS = [{ headerName: "No" }];
