export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_STATUS",
    field: "SIGNAL",
    align: "center",
    width: 50,
  },
  {
    type: "text",
    headerName: "LBL_DIVISION_CODE",
    field: "DIV_CD",
    editable: true, 
    insertable: true,
    fieldType: "text",
    isPrimaryKey: true,
    lock: true,
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_DIVISION_NAME",
    field: "DIV_NM",
    editable: true, 
    insertable: true,
    fieldType: "text",
    required: true,
    maxLength: 200,
  },
  {
    type: "text",
    headerName: "LBL_CUSTOMER_NAME",
    field: "CUST_CD",
    editable: true, 
    insertable: true,
    fieldType: "combo",
    required: true,
  },
  // TODO 주소찾기
];

export const SUB01_COLUMN_DEFS = [
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
    editable: true, 
    insertable: true,
    fieldType: "text",
    required: true,
    maxLength: 60,
  }, {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
    editable: true, 
    insertable: true,
    fieldType: "text",
    required: true,
    maxLength: 200, 
  }
];

