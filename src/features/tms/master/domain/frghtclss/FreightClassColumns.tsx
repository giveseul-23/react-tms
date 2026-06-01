// 컬럼 끝의 standardAudit 은 DataGrid 가 audit prop(model.bind 자동) 으로 추가.

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_FREIGHT_CLASS_CODE",
    field: "FRGHTCLSS_CD",
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_FREIGHT_CLASS_NAME",
    field: "FRGHTCLSS_NM",
    insertable: true,
    editable: true,
  },
];
