import { makeAuditColumns } from "@/app/components/grid/commonColumns";

// 메인 그리드
export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_RECEIVE_DATE", field: "CRE_DTTM" },
  { headerName: "LBL_INTERFAE_ID", field: "IF_ID" },
  {
    headerName: "LBL_INTERFACE_TCD",
    field: "TRANS_FLAG",
    codeKey: "interfaceType",
  },
  { headerName: "LBL_USR_RE_PRCS_YN", field: "RE_PRCS_BY_USR_YN" },
  {
    headerName: "LBL_PRCS_STS",
    field: "IF_PRCS_STS",
    codeKey: "interfaceStatus",
  },
  {
    headerName: "LBL_PRCS_MSG",
    field: "IF_PRCS_MSG_CD",
    codeKey: "interfaceMessage",
  },
  { headerName: "LBL_PRCS_MSG_DESC", field: "IF_PRCS_MSG_DESC" },
  { headerName: "LBL_ORDER_NO", field: "ORD_NO" },
  { headerName: "LBL_DIVISION_CODE", field: "DIV_CD" },
  { headerName: "LBL_DIVISION_NAME", field: "DIV_NM" },
  { headerName: "LBL_LOGISTICS_GROUP_CODE", field: "LGST_GRP_CD" },
  { headerName: "LBL_LOGISTICS_GROUP_NAME", field: "LGST_GRP_NM" },
  {
    headerName: "LBL_ORD_CRE_FLAG",
    field: "ORD_PRCS_TCD",
    codeKey: "ordCreFlag",
  },
  { headerName: "LBL_COMPANY_CD", field: "CUST_CD" },
  { headerName: "LBL_SALES_ORG_CD", field: "SALES_ORGN_CD" },
  { headerName: "LBL_PLANT_CD", field: "FRM_PLANT_CD" },
  { headerName: "LBL_SLOC_CD", field: "FRM_SLOC_CD" },
  { headerName: "LBL_SHPNT_CD", field: "SHIP_PIT" },
  { headerName: "LBL_DO_REQ_DT", field: "DLVRY_DT" },
  { headerName: "LBL_ORD_TP_CD", field: "ORD_TP" },
  { headerName: "LBL_DEPARTURE_CODE", field: "FRM_LOC_CD" },
  { headerName: "LBL_DEPARTURE_NAME", field: "FRM_LOC_NM" },
  { headerName: "LBL_DESTINATION_CD", field: "TO_LOC_CD" },
  { headerName: "LBL_DESTINATION_NM", field: "TO_LOC_NM" },
  { headerName: "LBL_SOLD_TO_CD", field: "SOLD_TO_CD" },
  { headerName: "LBL_SOLD_TO_NM", field: "SOLD_TO_NM" },
  { headerName: "LBL_REMARK", field: "REMARK" },
  { headerName: "LBL_COST_DISTR_FLAG", field: "COST_ALLOC_REQ_YN" },
  { headerName: "LBL_DISPATCH_NO", field: "REF_DSPCH_NO" },
  { headerName: "LBL_SHIPMENT_NO", field: "REF_SHPM_NO" },
  { headerName: "LBL_CUST_PICKUP_YN", field: "CUST_PICKUP_YN" },
  { headerName: "LBL_REG_YMD", field: "REG_YMD" },
  ...makeAuditColumns({
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// 납품상세
export const DETAIL_COLUMN_DEFS = [
  { headerName: "LBL_INTERFAE_ID", field: "IF_ID" },
  { headerName: "LBL_ORDER_NO", field: "ORD_NO" },
  { headerName: "LBL_ORD_LINE_CNT", field: "ORD_LINE_NO" },
  { headerName: "LBL_ITEM_CD", field: "CUST_ITM_CD" },
  { headerName: "LBL_PLAN_QTY", field: "PLN_ORD_QTY" },
  { headerName: "LBL_QTY_UOM", field: "PLN_ORD_QTY_UOM", codeKey: "itemUom" },
  { headerName: "LBL_TTL_NET_WGT", field: "PLN_NET_WGT" },
  { headerName: "LBL_PLN_VOL", field: "PLN_GROSS_VOL" },
  ...makeAuditColumns({
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];
