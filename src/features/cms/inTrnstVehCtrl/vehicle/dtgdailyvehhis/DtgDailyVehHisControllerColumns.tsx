// src/views/inTrnstVehCtrl/InTrnstVehCtrlColumns.tsx
// 수송중 차량제어 그리드 컬럼 정의

export const MAIN_COLUMN_DEFS = () => [
  { headerName: "No" },
  { headerName: "LBL_CARRIER_NAME", field: "CARR_NM" },
  { headerName: "LBL_VEH_NO", field: "VEH_NO" },
  { headerName: "LBL_DRIVER_NAME", field: "DRVR_NM" },
  { headerName: "LBL_VEHICLE_CODE", field: "VEH_ID" },
  { headerName: "LBL_DRIVER_CODE", field: "DRVR_ID" },
  { headerName: "LBL_VEHICLE_OPERATION_TYPE", field: "VEH_OP_TP" },
  { headerName: "LBL_LATITUDE", field: "LAT", type: "numeric" },
  { headerName: "LBL_LONGITUDE", field: "LON", type: "numeric" },
  { headerName: "LBL_UPDATE_TIME", field: "UPD_DTTM" },
];
