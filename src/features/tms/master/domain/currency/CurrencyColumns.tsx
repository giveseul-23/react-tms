// 컬럼 끝의 standardAudit 은 DataGrid 가 audit prop(model.bind 자동) 으로 추가.

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_CURRENCY_CODE",
    field: "CURR_CD",
  },
  {
    type: "text",
    headerName: "LBL_CURRENCY_NAME",
    field: "CURR_NM",
    editable: true, insertable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_DECIMAL_PRECISION",
    field: "DECIMAL_PRECISION",
  },
  {
    type: "combo",
    headerName: "LBL_CURR_RDNG_RCD",
    field: "CURR_RDNG_RCD",
    codeKey: "currRdngRcd",
    editable: true, insertable: true,
  },
  { type: "numeric", headerName: "LBL_DSPL_ORD", field: "DSPLY_SEQ" },
];
