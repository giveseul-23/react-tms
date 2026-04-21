// 메인 그리드
export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_RCV_DT", field: "RCV_DT" },
  { headerName: "LBL_IF_ID", field: "IF_ID" },
  { headerName: "LBL_IF_TYPE", field: "IF_TYPE", codeKey: "ifType" },
  { headerName: "LBL_USER_REPROCESS_YN", field: "USER_REPROCESS_YN" },
  { headerName: "LBL_IF_PRC_STS", field: "IF_PRC_STS", codeKey: "ifPrcSts" },
  { headerName: "LBL_PRC_MSG", field: "PRC_MSG" },
  { headerName: "LBL_MSG_DETAIL", field: "MSG_DETAIL" },
  { headerName: "LBL_ORD_NO", field: "ORD_NO" },
  { headerName: "LBL_DIV_CD", field: "DIV_CD" },
  { headerName: "LBL_DIV_NM", field: "DIV_NM" },
  { headerName: "LBL_LGST_OP_GRP_CD", field: "LGST_OP_GRP_CD" },
  { headerName: "LBL_LGST_OP_GRP_NM", field: "LGST_OP_GRP_NM" },
  { headerName: "LBL_ORD_CREATE_FLAG", field: "ORD_CREATE_FLAG" },
  { headerName: "LBL_COMP_CD", field: "COMP_CD" },
  { headerName: "LBL_SALES_OR", field: "LBL_SALES_OR" },
];

// 납품상세
export const DETAIL_COLUMN_DEFS = [
  { headerName: "LBL_IF_ID", field: "IF_ID" },
  { headerName: "LBL_ORD_NO", field: "ORD_NO" },
  { headerName: "LBL_DLV_DOC_LINE", field: "DLV_DOC_LINE" },
  { headerName: "LBL_ITEM_CD", field: "ITEM_CD" },
  { headerName: "LBL_PLAN_QTY", field: "PLAN_QTY", type: "numeric" },
  { headerName: "LBL_QTY_UOM", field: "QTY_UOM" },
  { headerName: "LBL_TOT_NET_WGT", field: "TOT_NET_WGT", type: "numeric" },
  { headerName: "LBL_PLAN_NET_VOL", field: "PLAN_NET_VOL", type: "numeric" },
  { headerName: "LBL_EXEC_DTTM", field: "EXEC_DTTM" },
  { headerName: "LBL_INS_USR_ID", field: "INS_USR_ID" },
  { headerName: "LBL_UPD_USR_ID", field: "UPD_USR_ID" },
  { headerName: "LBL_UPD_DTTM", field: "UPD_DTTM" },
];
