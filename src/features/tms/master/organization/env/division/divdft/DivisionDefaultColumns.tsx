// 컬럼 끝의 standardAudit 은 DataGrid 가 audit prop(model.bind 자동) 으로 추가.
// rowKeys 도 컬럼 정의와 함께 export — View 에선 단순 import 후 prop binding.

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
  {
    type: "combo",
    headerName: "LBL_SETTING_VAL",
    field: "CNFG_DTL_CD",
    codeKey: "cnfgDtlTcd",
    editable: true,
  },
];
