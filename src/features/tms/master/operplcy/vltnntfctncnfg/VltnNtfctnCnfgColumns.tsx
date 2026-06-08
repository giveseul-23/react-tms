import { validators } from "tailwind-merge";

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
  },
];

// 위반알림설정 (sub01) — 셀 편집
export const DETAIL_COLUMN_DEFS = [
  {
    type: "text",
    headerName: "LBL_VLTN_NTFCTN_CNFG_ID",
    field: "VLTN_NTFCTN_CNFG_ID",
    align: "center",
    width: 110,
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
    hide: true,
  },
  {
    type: "combo",
    headerName: "LBL_VLTN_NTFCTN_TCD",
    field: "VLTN_NTFCTN_TCD",
    codeKey: "vltnNtfctnTcd",
    insertable: true,
    required: true,
    width: 140,
  },
  {
    type: "date",
    headerName: "LBL_FROM_DTTM",
    field: "FRM_DTTM",
    insertable: true,
    required: true,
    align: "center",
  },
  {
    type: "date",
    headerName: "LBL_TO_DTTM",
    field: "TO_DTTM",
    insertable: true,
    required: true,
    align: "center",
  },
  {
    type: "numeric",
    headerName: "LBL_CNSCTV_VLTN_CNT",
    field: "CNSCTV_VLTN_CNT",
    insertable: true,
    editable: true,
    required: true,
    validators: { min: 0, max: 999 },
  },
  {
    type: "numeric",
    headerName: "LBL_MAX_VLTN_NTFCTN_CNT",
    field: "MAX_VLTN_NTFCTN_CNT",
    insertable: true,
    editable: true,
    required: true,
    validators: { min: 0, max: 9 },
  },
  {
    type: "numeric",
    headerName: "LBL_VLTN_NTFCTN_INTRVL",
    field: "VLTN_NTFCTN_INTRVL",
    insertable: true,
    editable: true,
    required: true,
    validators: { min: 0 },
  },
  {
    type: "check",
    headerName: "LBL_USE_Y/N",
    field: "USE_YN",
    insertable: true,
    editable: true,
    width: 70,
  },
];

// 알림채널 (sub02) — 셀 편집
export const NTFC_CHANNEL_COLUMN_DEFS = [
  {
    type: "text",
    headerName: "LBL_VLTN_NTFCTN_CNFG_ID",
    field: "VLTN_NTFCTN_CNFG_ID",
    hide: true,
  },
  {
    type: "combo",
    headerName: "LBL_NTFCTN_CHNL_TCD",
    field: "NTFCTN_CHNL_TCD",
    codeKey: "ntfctnChnlTcd",
    insertable: true,
    required: true,
    width: 130,
  },
  {
    type: "text",
    headerName: "LBL_NTFCTN_MSG_TMPLT",
    field: "NTFCTN_MSG_TMPLT",
    insertable: true,
    width: 350,
  },
  {
    type: "check",
    headerName: "LBL_USE_Y/N",
    field: "USE_YN",
    insertable: true,
    editable: true,
    width: 70,
  },
];

// 알림수신자 (sub03) — 셀 편집
export const NTFC_TARGET_COLUMN_DEFS = [
  {
    type: "text",
    headerName: "LBL_VLTN_NTFCTN_RCVR_ID",
    field: "VLTN_NTFCTN_RCVR_ID",
    align: "center",
    width: 110,
  },
  {
    type: "text",
    headerName: "LBL_VLTN_NTFCTN_CNFG_ID",
    field: "VLTN_NTFCTN_CNFG_ID",
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_RECEIVER_NM",
    field: "RCVR_NM",
    insertable: true,
    editable: true,
  },
  {
    type: "text",
    headerName: "LBL_MBL_NO",
    field: "MBL_PHN_NO",
    insertable: true,
    editable: true,
    align: "center",
    width: 120,
    validators: {
      regexTp: "PHONE",
      regexText: "MSG_SEND_SMS_ERR",
    },
  },
  {
    type: "text",
    headerName: "LBL_EMAIL_ADDR",
    field: "EMAIL_ADDR",
    insertable: true,
    editable: true,
    align: "center",
    width: 180,
    validators: {
      regexTp: "EMAIL",
      regexText: "MSG_INVALID_EMAIL_FORMAT",
    },
  },
];
