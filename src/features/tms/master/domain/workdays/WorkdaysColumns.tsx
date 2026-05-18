// 컬럼 끝의 standardAudit 은 DataGrid 가 audit prop(model.bind 자동) 으로 추가.

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
  {
    type: "numeric",
    headerName: "LBL_WORKINGDAY_YMD",
    field: "WRK_DAY",
  },
  {
    type: "combo",
    headerName: "LBL_WORKING_DAY_CLASSIFICATION",
    field: "WRK_DAY_TP",
    codeKey: "wrkDayTp",
    editable: true,
  },
];
