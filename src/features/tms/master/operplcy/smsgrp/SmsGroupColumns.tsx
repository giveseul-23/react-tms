// 컬럼 끝의 audit 은 DataGrid 가 audit prop(model.bind 자동) 으로 추가.

// 키 컬럼에 isPrimaryKey:true — DataGrid 가 첫행 자동선택을 자동 활성화.
export const MAIN_COLUMN_DEFS = [
  {
    type: "text",
    headerName: "LBL_SMS_GRP_CD",
    field: "SMS_GRP_CD",
    isPrimaryKey: true,
  },
  {
    type: "text",
    headerName: "LBL_SMS_GRP_DESC",
    field: "SMS_GRP_DESC",
  },
  {
    type: "text",
    headerName: "LBL_USE_Y/N",
    field: "USE_YN",
  },
];

export const DETAIL_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_SMS_GRP_CD", field: "SMS_GRP_CD" },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_CODE", field: "LGST_GRP_CD" },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
    codeKey: "vltnNtfctnTcd",
  },
  { type: "text", headerName: "LBL_RECEIVER_ID", field: "USR_ID" },
  { type: "text", headerName: "LBL_RECEIVER_NM", field: "USR_NM" },
];
