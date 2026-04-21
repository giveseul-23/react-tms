import { makeAuditColumns } from "@/app/components/grid/commonColumns";

// 일일실적 (메인) 그리드
export const DAILY_MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_DLV_REQ_DT", field: "DLV_REQ_DT" },
  { headerName: "LBL_SETL_PRG_STS", field: "SETL_PRG_STS", codeKey: "setlPrgSts" },
  { headerName: "LBL_PAY_TPCO_NM", field: "PAY_TPCO_NM" },
  { headerName: "LBL_VEH_NO", field: "VEH_NO" },
  { headerName: "LBL_DRV_NM", field: "DRV_NM" },
  { headerName: "LBL_WORK_PLAN", field: "WORK_PLAN" },
  { headerName: "LBL_WORK_EXEC", field: "WORK_EXEC" },
  { headerName: "LBL_FARE_CALC_TP", field: "FARE_CALC_TP" },
  { headerName: "LBL_DL_CLOSE_STS", field: "DL_CLOSE_STS", codeKey: "dlCloseSts" },
  { headerName: "LBL_SETL_DIST_KM", field: "SETL_DIST_KM", type: "numeric" },
  { headerName: "LBL_SETL_DOC_NO", field: "SETL_DOC_NO" },
  { headerName: "LBL_EDIT_STS", field: "EDIT_STS", codeKey: "editSts" },
  ...makeAuditColumns({
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// 상세내역 그리드
export const DAILY_DETAIL_COLUMN_DEFS = [
  { headerName: "LBL_DLV_REQ_DT", field: "DLV_REQ_DT" },
  { headerName: "LBL_VEH_NO", field: "VEH_NO" },
  { headerName: "LBL_DRV_NM", field: "DRV_NM" },
  { headerName: "LBL_VEH_TP_NM", field: "VEH_TP_NM" },
  { headerName: "LBL_TRIP_CNT", field: "TRIP_CNT", type: "numeric" },
  { headerName: "LBL_DSPCH_ROUTE", field: "DSPCH_ROUTE" },
  { headerName: "LBL_SETL_ROUTE", field: "SETL_ROUTE" },
  {
    headerName: "KPP",
    children: [
      { headerName: "LBL_OUT", field: "KPP_OUT_QTY", type: "numeric" },
      { headerName: "LBL_IN", field: "KPP_IN_QTY", type: "numeric" },
    ],
  },
  {
    headerName: "LBL_AJU_PLT",
    children: [
      { headerName: "LBL_OUT", field: "AJU_OUT_QTY", type: "numeric" },
      { headerName: "LBL_IN", field: "AJU_IN_QTY", type: "numeric" },
    ],
  },
  {
    headerName: "LBL_ETC_PLT",
    children: [
      { headerName: "LBL_OUT", field: "ETC_OUT_QTY", type: "numeric" },
      { headerName: "LBL_IN", field: "ETC_IN_QTY", type: "numeric" },
    ],
  },
  {
    headerName: "LBL_SILVER_DAECHA",
    children: [
      { headerName: "LBL_OUT", field: "SLV_OUT_QTY", type: "numeric" },
      { headerName: "LBL_IN", field: "SLV_IN_QTY", type: "numeric" },
    ],
  },
];
