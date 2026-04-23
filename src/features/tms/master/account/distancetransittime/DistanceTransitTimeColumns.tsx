import { makeAuditColumns } from "@/app/components/grid/commonColumns";
import { numberValueFormatter } from "@/app/components/grid/commonFormatters";

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_DIV_CD", field: "DIV_CD" },
  { headerName: "LBL_DIV_NM", field: "DIV_NM" },
  { headerName: "LBL_FROM_LOC_CD", field: "FROM_LOC_CD" },
  { headerName: "LBL_FROM_LOC_NM", field: "FROM_LOC_NM" },
  { headerName: "LBL_TO_LOC_CD", field: "TO_LOC_CD" },
  { headerName: "LBL_TO_LOC_NM", field: "TO_LOC_NM" },
  {
    headerName: "LBL_MOVE_DISTANCE_KM",
    field: "MOVE_DIST_KM",
    aggFunc: "sum",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_TMAP_MOVE_DISTANCE_KM",
    field: "TMAP_MOVE_DIST_KM",
    aggFunc: "sum",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_TRANS_TIME_MIN",
    field: "TRANS_TIME_MIN",
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_EXP_TOLL_FEE",
    field: "EXP_TOLL_FEE",
    valueFormatter: numberValueFormatter,
  },
  { headerName: "LBL_ROUTE_OPT_TP", field: "ROUTE_OPT_TP" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// 이력 그리드
export const HISTORY_COLUMN_DEFS = [
  { headerName: "No" },
  {
    headerName: "LBL_MOVE_DISTANCE_KM",
    field: "MOVE_DIST_KM",
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_TMAP_MOVE_DISTANCE_KM",
    field: "TMAP_MOVE_DIST_KM",
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_TRANS_TIME_MIN",
    field: "TRANS_TIME_MIN",
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_EXP_TOLL_FEE",
    field: "EXP_TOLL_FEE",
    valueFormatter: numberValueFormatter,
  },
  { headerName: "LBL_CHANGE_REASON", field: "CHG_RSN" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
  { headerName: "LBL_BASE_TIME", field: "BASE_TM" },
];
