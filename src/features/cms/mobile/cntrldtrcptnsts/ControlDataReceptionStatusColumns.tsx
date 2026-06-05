export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "date",
    headerName: "LBL_TRANSACTION_DLVRY_DT",
    field: "DLVRY_DT",
  },
  {
    type: "text",
    headerName: "LBL_DISPATCH_NO",
    field: "DSPCH_NO",
  },
  {
    type: "text",
    headerName: "LBL_VEHICLE_OPERATION_TYPE",
    field: "VEH_OP_TP",
    codeKey: "vehOpTypeList",
  },
  {
    type: "text",
    headerName: "LBL_VEHICLE_TYPE_NAME",
    field: "VEH_TP_NM",
  },
  {
    type: "text",
    headerName: "LBL_VEH_NO",
    field: "VEH_NO",
  },
  {
    type: "text",
    headerName: "LBL_DRIVER_NM",
    field: "DRVR_NM",
  },
  {
    type: "text",
    headerName: "LBL_LATITUDE",
    field: "LAT",
  },
  {
    type: "text",
    headerName: "LBL_LONGITUDE",
    field: "LON",
  },
  {
    type: "text",
    headerName: "LBL_UPDATE_GAP",
    field: "LATEST_UPDATE_DTTM",
  },
  {
    type: "text",
    headerName: "LBL_DISPATCH_OPERATIONAL_STATUS",
    field: "DSPCH_OP_STS",
    codeKey: "dspchOpStsList",
  },
  {
    type: "numeric",
    headerName: "LBL_GAP_TIME_MIN",
    field: "GAP_TIME",
  },
  {
    type: "text",
    headerName: "LBL_REST_YN",
    field: "REST_YN",
  },
  {
    type: "text",
    headerName: "LBL_REST_START_TIME",
    field: "REST_START_DTTM",
  },
  {
    type: "text",
    headerName: "LBL_ADDITIONAL_REST_MIN",
    field: "ADDITIONAL_REST_MIN",
  },
];
