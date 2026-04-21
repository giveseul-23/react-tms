import { makeAuditColumns } from "@/app/components/grid/commonColumns";

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_SETL_DOC_NO", field: "SETL_DOC_NO" },
  { headerName: "LBL_CLOSE_DT", field: "CLOSE_DT" },
  { headerName: "LBL_SETL_PRG_STS", field: "SETL_PRG_STS", codeKey: "setlPrgSts" },
  { headerName: "LBL_VEH_NO", field: "VEH_NO" },
  { headerName: "LBL_DRV_NM", field: "DRV_NM" },
  { headerName: "LBL_VEH_TP", field: "VEH_TP" },
  { headerName: "LBL_ACTUAL_TRIP_CNT", field: "ACTUAL_TRIP_CNT", type: "numeric" },
  { headerName: "LBL_SETL_DIST_KM", field: "SETL_DIST_KM", type: "numeric" },
  { headerName: "LBL_CTRT_CD", field: "CTRT_CD" },
  { headerName: "LBL_EDIT_STS", field: "EDIT_STS", codeKey: "editSts" },
  ...makeAuditColumns({
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];
