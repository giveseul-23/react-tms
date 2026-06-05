// 컬럼 끝의 standardAudit 은 DataGrid 가 audit prop(model.bind 자동) 으로 추가.

export const MAIN_COLUMN_DEFS = [
  { headerName: "No", align: "right" },
  {
    type: "text",
    headerName: "LBL_COMMODITY_CODE",
    field: "CMDT_CD",
    width: 150,
    editable: true,
    insertable: true,
    isPrimaryKey: true,
  },
  {
    type: "text",
    headerName: "LBL_COMMODITY_NAME",
    field: "CMDT_NM",
    width: 150,
    editable: true,
    insertable: true,
  },
];
