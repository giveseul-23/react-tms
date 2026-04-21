import { makeAuditColumns } from "@/app/components/grid/commonColumns";

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_AP_ID", field: "AP_ID" },
  { headerName: "LBL_DEAD_LINE", field: "TO_DTTM" },
  { headerName: "LBL_FINANCIAL_STATUS", field: "AP_FI_STS", codeKey: "fiSts" },
  { headerName: "LBL_VEHICLE_NUMBER", field: "VEH_NO" },
  { headerName: "LBL_DRIVER_NAME", field: "DRVR_NM" },
  { headerName: "LBL_VEHICLE_TYPE", field: "VEH_TP_NM" },
  { headerName: "LBL_REAL_RTN_CNT", field: "TTL_RTN_CNT" },
  { headerName: "LBL_FI_DIST_KM", field: "TTL_FI_DIST" },
  { headerName: "LBL_DISPATCH_RATE_CD", field: "TRF_CD" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];
