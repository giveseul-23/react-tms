// src/views/inTrnstVehCtrl/InTrnstVehCtrlColumns.tsx
// 수송중 차량제어 그리드 컬럼 정의

export const MAIN_COLUMN_DEFS = () => [
  { headerName: "No" },
  { headerName: "LBL_DLVRY_DATE", field: "DLVRY_DT" },
  { headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO" },
  { headerName: "LBL_VEH_NO", field: "VEH_NO" },

  { headerName: "LBL_DRIVER_NAME", field: "DRVR_NM" },
  { headerName: "LBL_ROTATION", field: "RTN_NO" },
  { headerName: "LBL_VEHICLE_OPERATION_TYPE", field: "VEH_OP_TP" },
  { headerName: "LBL_PLN_DSPCH_ROUTE", field: "LOC_NM" },
  { headerName: "LBL_VEHICLE_CODE", field: "VEH_ID" },
  { headerName: "LBL_UPDATE_LBL_DRIVER_CODETIME", field: "DRVR_ID" },
];
