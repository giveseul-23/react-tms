export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_CARRIER_NAME", field: "CARR_NM", type: "text" },
  { headerName: "LBL_VEH_NO", field: "VEH_NO", type: "text" },
  {
    headerName: "LBL_DRIVER_NAME",
    field: "DRVR_NM",
    type: "text",
    align: "center",
  },
  { field: "VEH_ID", type: "text", hide: true },
  { headerName: "LBL_VEH_NO", field: "VEH_NO", type: "text" },
  { field: "VEH_ID", type: "text", hide: true },
  {
    headerName: "LBL_VEHICLE_OPERATION_TYPE",
    field: "VEH_OP_TP",
    type: "combo",
    codeKey: "vehOpTpList",
    align: "center",
  },
  { headerName: "LBL_LATITUDE", field: "LAT", type: "numeric" },
  { headerName: "LBL_LONGITUDE", field: "LON", type: "numeric" },
];
