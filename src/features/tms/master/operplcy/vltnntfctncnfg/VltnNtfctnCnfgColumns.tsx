import { makeAuditColumns } from "@/app/components/grid/commonColumns";

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
  },
  {
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
  },
];

export const DETAIL_COLUMN_DEFS = [
  { headerName: "LBL_VLTN_NTFCTN_CNFG_ID", field: "VLTN_NTFCTN_CNFG_ID" },
  { headerName: "LBL_LOGISTICS_GROUP_CODE", field: "LGST_GRP_CD" },
  {
    headerName: "LBL_VLTN_NTFCTN_TCD",
    field: "VLTN_NTFCTN_TCD",
    codeKey: "vltnNtfctnTcd",
  },
  { headerName: "LBL_FROM_DTTM", field: "FRM_DTTM" },
  { headerName: "LBL_TO_DTTM", field: "TO_DTTM" },
  { headerName: "LBL_CNSCTV_VLTN_CNT", field: "CNSCTV_VLTN_CNT" },
  { headerName: "LBL_MAX_VLTN_NTFCTN_CNT", field: "MAX_VLTN_NTFCTN_CNT" },
  { headerName: "LBL_VLTN_NTFCTN_INTRVL", field: "VLTN_NTFCTN_INTRVL" },
  { headerName: "LBL_USE_Y/N", field: "USE_YN" },
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
  { headerName: "LBL_VLTN_NTFCTN_CNFG_ID", field: "VLTN_NTFCTN_CNFG_ID" },
  {
    headerName: "LBL_NTFCTN_CHNL_TCD",
    field: "NTFCTN_CHNL_TCD",
    codeKey: "ntfctnChnlTcd",
  },
  { headerName: "LBL_NTFCTN_MSG_TMPLT", field: "NTFCTN_MSG_TMPLT" },
  { headerName: "LBL_USE_Y/N", field: "USE_YN" },
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
  { headerName: "LBL_VLTN_NTFCTN_RCVR_ID", field: "VLTN_NTFCTN_RCVR_ID" },
  { headerName: "LBL_VLTN_NTFCTN_CNFG_ID", field: "VLTN_NTFCTN_CNFG_ID" },
  { headerName: "LBL_RECEIVER_NM", field: "RCVR_NM" },
  { headerName: "LBL_MBL_NO", field: "MBL_PHN_NO" },
  { headerName: "LBL_MBL_NO", field: "MBL_PHN_NO" },
  { headerName: "LBL_EMAIL_ADDR", field: "EMAIL_ADDR" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];
