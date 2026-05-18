// 컬럼 끝의 standardAudit 은 DataGrid 가 audit prop(model.bind 자동) 으로 추가.
// 키 컬럼에 isPrimaryKey:true — DataGrid 가 rowKeys/autoSelectFirstRow 자동 활성화.
// CNFG_CD 는 화면 표시 X — hidden 컬럼으로 메타만 유지.

export const MAIN_COLUMN_DEFS = [
  { field: "CNFG_CD", hide: true, isPrimaryKey: true },
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
    editable: true, insertable: true,
  },
];
