import { makeAuditColumns } from "@/app/components/grid/commonColumns";

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
  },
];

export const DETAIL_COLUMN_DEFS = [
  { type: "text", headerName: "LBL_VLTN_NTFCTN_CNFG_ID", field: "VLTN_NTFCTN_CNFG_ID" },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_CODE", field: "LGST_GRP_CD" },
  {
    type: "text",
    headerName: "LBL_VLTN_NTFCTN_TCD",
    field: "VLTN_NTFCTN_TCD",
    codeKey: "vltnNtfctnTcd",
  },
  { type: "text", headerName: "LBL_FROM_DTTM", field: "FRM_DTTM" },
  { type: "text", headerName: "LBL_TO_DTTM", field: "TO_DTTM" },
  { type: "text", headerName: "LBL_CNSCTV_VLTN_CNT", field: "CNSCTV_VLTN_CNT" },
  { type: "text", headerName: "LBL_MAX_VLTN_NTFCTN_CNT", field: "MAX_VLTN_NTFCTN_CNT" },
  { type: "text", headerName: "LBL_VLTN_NTFCTN_INTRVL", field: "VLTN_NTFCTN_INTRVL" },
  { type: "text", headerName: "LBL_USE_Y/N", field: "USE_YN" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

export const NTFC_CHANNEL_COLUMN_DEFS = [
  { type: "text", headerName: "LBL_VLTN_NTFCTN_CNFG_ID", field: "VLTN_NTFCTN_CNFG_ID" },
  {
    type: "text",
    headerName: "LBL_NTFCTN_CHNL_TCD",
    field: "NTFCTN_CHNL_TCD",
    codeKey: "ntfctnChnlTcd",
  },
  { type: "text", headerName: "LBL_NTFCTN_MSG_TMPLT", field: "NTFCTN_MSG_TMPLT" },
  { type: "text", headerName: "LBL_USE_Y/N", field: "USE_YN" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

export const NTFC_TARGET_COLUMN_DEFS = [
  { type: "text", headerName: "LBL_VLTN_NTFCTN_RCVR_ID", field: "VLTN_NTFCTN_RCVR_ID" },
  { type: "text", headerName: "LBL_VLTN_NTFCTN_CNFG_ID", field: "VLTN_NTFCTN_CNFG_ID" },
  { type: "text", headerName: "LBL_RECEIVER_NM", field: "RCVR_NM" },
  { type: "text", headerName: "LBL_MBL_NO", field: "MBL_PHN_NO" },
  { type: "text", headerName: "LBL_MBL_NO", field: "MBL_PHN_NO" },
  { type: "text", headerName: "LBL_EMAIL_ADDR", field: "EMAIL_ADDR" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];
