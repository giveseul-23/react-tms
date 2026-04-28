import { standardAudit } from "@/app/components/grid/commonColumns";

export const MAIN_COLUMN_DEFS = (setGridData?: (updater: any) => void) => [
  { headerName: "No" },
  { type: "date", headerName: "LBL_DLVRY_DATE", field: "DLVRY_DT" },
  { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO" },
  { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO" },
  { type: "text", headerName: "LBL_DRIVER_NAME", field: "DRVR_NM" },
  { type: "numeric", headerName: "LBL_ROTATION", field: "RTN_NO" },
  {
    type: "text",
    headerName: "LBL_VEHICLE_OPERATION_TYPE",
    field: "VEH_OP_TP",
    codeKey: "vehOpTypeList",
    align: "center",
  },
  { type: "text", headerName: "LBL_PLN_DSPCH_ROUTE", field: "LOC_NM" },
  { type: "text", headerName: "LBL_VEHICLE_CODE", field: "VEH_ID" },
  { type: "text", headerName: "LBL_DRIVER_CODE", field: "DRVR_ID" },
];
