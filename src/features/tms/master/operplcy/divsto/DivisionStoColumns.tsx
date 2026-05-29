export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_DIVISION_CODE",
    field: "DIV_CD",
    isPrimaryKey: true,
  },
  {
    type: "text",
    headerName: "LBL_DIVISION_NAME",
    field: "DIV_NM",
  },
  {
    type: "numeric",
    headerName: "LBL_REGI_STO_DIVISION_CNT",
    field: "REGI_STO_DIVISION_CNT",
  },
];

export const DETAIL_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "popup",
    headerName: "LBL_STO_DIVISION_CODE",
    field: "STO_DIV_CD",
    nameField: "DIV_NM",
    sqlId: "selectDivisionCodeName",
    popupTitle: "LBL_STO_DIVISION_CODE",
    isPrimaryKey: true,
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_STO_DIVISION_NAME",
    field: "DIV_NM",
  },
];
