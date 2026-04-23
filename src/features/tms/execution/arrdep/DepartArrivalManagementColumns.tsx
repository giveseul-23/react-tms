import { makeAuditColumns } from "@/app/components/grid/commonColumns";
import { numberValueFormatter } from "@/app/components/grid/commonFormatters";

// 메인 배차 그리드
export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_DELIVERY_REQ_DT", field: "DLVRY_REQ_DT" },
  { headerName: "LBL_DSPCH_NO", field: "DSPCH_NO" },
  { headerName: "LBL_DSPCH_PRGS_STS", field: "DSPCH_PRGS_STS" },
  { headerName: "LBL_CARR_CD", field: "CARR_CD" },
  { headerName: "LBL_CARR_NM", field: "CARR_NM" },
  { headerName: "LBL_ROUTE", field: "ROUTE" },
  {
    headerName: "LBL_CNFRM_NET_WGT",
    field: "CNFRM_NET_WGT",
    aggFunc: "sum",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  { headerName: "LBL_DLVRY_START_RPT_DTTM", field: "DLVRY_START_RPT_DTTM" },
  { headerName: "LBL_DLVRY_START_RPT_USR_ID", field: "DLVRY_START_RPT_USR_ID" },
  { headerName: "LBL_DLVRY_END_RPT_DTTM", field: "DLVRY_END_RPT_DTTM" },
  { headerName: "LBL_DLVRY_END_RPT_USR_ID", field: "DLVRY_END_RPT_USR_ID" },
  { headerName: "LBL_FORCE_DRV_END_YN", field: "FORCE_DRV_END_YN" },
  { headerName: "LBL_TURN", field: "TURN" },
  { headerName: "LBL_VEH_NO", field: "VEH_NO" },
  { headerName: "LBL_DRIVER_NM", field: "DRIVER_NM" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// 경유처
export const STOPOVER_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_SEQ", field: "SEQ" },
  { headerName: "LBL_ACT_DRV_SEQ", field: "ACT_DRV_SEQ" },
  { headerName: "LBL_LOC_KIND", field: "LOC_KIND" },
  { headerName: "LBL_LOC_CD", field: "LOC_CD" },
  { headerName: "LBL_LOC_NM", field: "LOC_NM" },
  { headerName: "LBL_EXP_ARR_TM", field: "EXP_ARR_TM" },
  { headerName: "LBL_ARR_TM", field: "ARR_TM" },
  { headerName: "LBL_DEP_TM", field: "DEP_TM" },
  { headerName: "LBL_ARR_INPUT_KIND", field: "ARR_INPUT_KIND" },
  { headerName: "LBL_ARR_INPUT_USR_ID", field: "ARR_INPUT_USR_ID" },
  { headerName: "LBL_DEP_INPUT_KIND", field: "DEP_INPUT_KIND" },
  { headerName: "LBL_DEP_INPUT_USR_ID", field: "DEP_INPUT_USR_ID" },
  { headerName: "LBL_FEED_MOVE", field: "FEED_MOVE" },
  { headerName: "LBL_SVC_ACTIVITY", field: "SVC_ACTIVITY" },
  {
    headerName: "LBL_PREV_MOVE_DIST",
    field: "PREV_MOVE_DIST",
    valueFormatter: numberValueFormatter,
  },
];

// 할당주문
export const ASSIGNED_ORDER_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_SEQ", field: "SEQ" },
  { headerName: "LBL_ORDER_NO", field: "ORDER_NO" },
  { headerName: "LBL_ORDER_TP", field: "ORDER_TP" },
  { headerName: "LBL_FROM_LOC_NM", field: "FROM_LOC_NM" },
  { headerName: "LBL_TO_LOC_NM", field: "TO_LOC_NM" },
  { headerName: "LBL_ITEM_CD", field: "ITEM_CD" },
  { headerName: "LBL_ITEM_NM", field: "ITEM_NM" },
  {
    headerName: "LBL_QTY",
    field: "QTY",
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_NET_WGT",
    field: "NET_WGT",
    valueFormatter: numberValueFormatter,
  },
];
