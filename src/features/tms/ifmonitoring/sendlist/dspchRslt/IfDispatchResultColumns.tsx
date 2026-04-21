import { makeAuditColumns } from "@/app/components/grid/commonColumns";

export const MAIN_COLUMN_DEFS = [
  { headerName: "LBL_ITM_CD", field: "CUST_ITEM_CD" },
  { headerName: "LBL_ITM_NM", field: "CUST_ITEM_NM" },
  { headerName: "LBL_QTY", field: "PLN_QTY" },
  { headerName: "LBL_PLANT_CD", field: "PLANT_CD" },
  { headerName: "LBL_TMS_IF_PRCS_ID", field: "TMS_IF_PRCS_ID" },
  { headerName: "LBL_TMS_IF_PRCS_START_DTTM", field: "TMS_IF_PRCS_START_DTTM" },
  { headerName: "LBL_TMS_IF_PRCS_END_DTTM", field: "TMS_IF_PRCS_END_DTTM" },
  ...makeAuditColumns({
    insertPerson: true,
    updatePerson: true,
    updateTime: true,
  }),
];
