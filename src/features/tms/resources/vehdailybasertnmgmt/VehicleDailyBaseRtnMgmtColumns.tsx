export const MAIN_COLUMN_DEFS = [
  { headerName: "No" }, // 자동 일련번호
  {
    type: "text",
    headerName: "LBL_ID",
    field: "BASE_RTN_CNT_ID",
  },
  {
    type: "text",
    headerName: "LBL_VEH_NO",
    field: "VEH_NO",
    required: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_VEHICLE_TYPE",
    field: "VEH_TP_NM"
  },
  {
    type: "text",
    headerName: "LBL_DRIVER_NAME",
    field: "DRVR_NM",
  },
  {
    type: "date",
    headerName: "LBL_FROM_DTTM",
    field: "START_DTTM",
    required: true,
    insertable: true,
    editable: true,
  },
  {
    type: "date",
    headerName: "LBL_TO_DTTM",
    field: "END_DTTM",
    required: true,
    insertable: true,
    editable: true,
  },
  {
    type: "number",
    headerName: "LBL_BASE_RTN_CNT",
    field: "BASE_RTN_CNT",
    required: true,
    insertable: true,
    editable: true,
  }
]