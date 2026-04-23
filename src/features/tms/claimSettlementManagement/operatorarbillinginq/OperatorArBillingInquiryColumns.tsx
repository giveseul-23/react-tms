import { makeAuditColumns } from "@/app/components/grid/commonColumns";
import { numberValueFormatter } from "@/app/components/grid/commonFormatters";

// 메인 정산 그리드
export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_SETL_DOC_NO", field: "SETL_DOC_NO" },
  { headerName: "LBL_PRGS_STS", field: "PRGS_STS" },
  { headerName: "LBL_AR_FROM_DT", field: "AR_FROM_DT" },
  { headerName: "LBL_AR_CLOSE_DT", field: "AR_CLOSE_DT" },
  { headerName: "LBL_AR_CALC_TP_CD", field: "AR_CALC_TP_CD" },
  {
    headerName: "LBL_TOTAL_CALC_AMT",
    field: "TTL_CALC_AMT",
    aggFunc: "sum",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_OPER_CNFRM_AMT",
    field: "OPER_CNFRM_AMT",
    aggFunc: "sum",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_APPROVED_AMT",
    field: "APRV_AMT",
    aggFunc: "sum",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  { headerName: "LBL_CUST_CD", field: "CUST_CD" },
  { headerName: "LBL_CUST_NM", field: "CUST_NM" },
  { headerName: "LBL_CUST_CNTR_CD", field: "CUST_CNTR_CD" },
  { headerName: "LBL_CUST_CNTR_NM", field: "CUST_CNTR_NM" },
  { headerName: "LBL_AR_CNTR_CD", field: "AR_CNTR_CD" },
  { headerName: "LBL_AR_CNTR_LVL_CD", field: "AR_CNTR_LVL_CD" },
  { headerName: "LBL_SETL_BASIS_TP", field: "SETL_BASIS_TP" },
  { headerName: "LBL_REF_AR_SETL_DOC_NO", field: "REF_AR_SETL_DOC_NO" },
  ...makeAuditColumns({
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// 청구항목
export const BILLING_ITEM_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_ITEM_CD", field: "ITEM_CD" },
  { headerName: "LBL_ITEM_NM", field: "ITEM_NM" },
  {
    headerName: "LBL_CALC_AMT",
    field: "CALC_AMT",
    aggFunc: "sum",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_OPER_CNFRM_AMT",
    field: "OPER_CNFRM_AMT",
    aggFunc: "sum",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  { headerName: "LBL_OPER_ADJ_REASON", field: "OPER_ADJ_REASON" },
  { headerName: "LBL_DOC_CNT", field: "DOC_CNT" },
  { headerName: "LBL_AMT_SIGN", field: "AMT_SIGN" },
  { headerName: "LBL_AR_ACCT_CD", field: "AR_ACCT_CD" },
  { headerName: "LBL_AR_CALC_RSLT", field: "AR_CALC_RSLT" },
  { headerName: "LBL_SETL_DOC_DTL_NO", field: "SETL_DOC_DTL_NO" },
  { headerName: "LBL_SETL_DOC_NO", field: "SETL_DOC_NO" },
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
  { headerName: "LBL_ORDER_NO", field: "ORDER_NO" },
  { headerName: "LBL_ORDER_TP", field: "ORDER_TP" },
  { headerName: "LBL_FROM_LOC_NM", field: "FROM_LOC_NM" },
  { headerName: "LBL_TO_LOC_NM", field: "TO_LOC_NM" },
  { headerName: "LBL_ITEM_CD", field: "ITEM_CD" },
  { headerName: "LBL_ITEM_NM", field: "ITEM_NM" },
  {
    headerName: "LBL_QTY",
    field: "QTY",
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_AMT",
    field: "AMT",
    valueFormatter: numberValueFormatter,
  },
];

// 증빙문서
export const ATTACHMENT_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_FILE_NM", field: "FILE_NM" },
  { headerName: "LBL_FILE_SIZE", field: "FILE_SIZE" },
  { headerName: "LBL_UPLOAD_USR", field: "UPLOAD_USR" },
  { headerName: "LBL_UPLOAD_DTTM", field: "UPLOAD_DTTM" },
];
