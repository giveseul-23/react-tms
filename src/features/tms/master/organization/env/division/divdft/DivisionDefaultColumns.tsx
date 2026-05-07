// 컬럼 끝의 standardAudit 은 DataGrid 가 audit prop(model.bind 자동) 으로 추가.

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_SETTING_ITEM",
    field: "CNFG_NM",
  },
];

export const DETAIL_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_DIVISION_CODE", field: "DIV_CD" },
  { type: "text", headerName: "LBL_DIVISION_NAME", field: "DIV_NM" },
  { type: "text", headerName: "LBL_SETTING_VAL", field: "CNFG_DTL_CD" },
];
