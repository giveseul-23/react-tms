// src/views/inTrnstVehCtrl/InTrnstVehCtrlColumns.tsx
// 수송중 차량제어 그리드 컬럼 정의

export const MAIN_COLUMN_DEFS = () => [
  { headerName: "No" },
  { headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO" },
  { headerName: "LBL_VEH_NO", field: "VEH_NO" },
  { headerName: "LBL_DRIVER_NAME", field: "DRVR_NM" },
  { headerName: "LBL_CARRIER_NAME", field: "CARR_NM" },
  { headerName: "LBL_LOGISTICS_GROUP", field: "LGST_GRP_CD" },
  { headerName: "LBL_DEPARTURE_NAME", field: "FRM_LOC_NM" },
  { headerName: "LBL_ARRIVAL_NAME", field: "TO_LOC_NM" },
  { headerName: "LBL_REQUESTED_DELIVERY_DATE", field: "DLVRY_DT" },
  { headerName: "LBL_DISPATCH_OPERATIONAL_STATUS", field: "DSPCH_OP_STS" },
  { headerName: "LBL_LATITUDE", field: "LAT", type: "numeric" },
  { headerName: "LBL_LONGITUDE", field: "LON", type: "numeric" },
  { headerName: "LBL_LAST_REPORT_DTTM", field: "LAST_RPT_DTTM" },
];
