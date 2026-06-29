export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_DRIVER_CODE",
    field: "DRVR_ID",
    isPrimaryKey: true,
    insertable: true,
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_DRIVER_NAME",
    field: "DRVR_NM",
    editable: true,
    insertable: true,
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_HP_NO",
    field: "MBL_PHN_NO",
    editable: true,
    insertable: true,
    required: true,
  },
];

export const SUB01_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "popup",
    headerName: "LBL_CUSTOMER_CODE",
    field: "CUST_CD",
    nameField: "CUST_NM",
    sqlId: "selectCustomerCodeNameFilterList",
    popupTitle: "LBL_CUSTOMER_CODE",
    isPrimaryKey: true,
    insertable: true,
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_CUSTOMER_NAME",
    field: "CUST_NM",
  },
];
