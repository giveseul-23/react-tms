import { makeAuditColumns } from "@/app/components/grid/commonColumns";
import { numberValueFormatter } from "@/app/components/grid/commonFormatters";

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_DIVISION_CODE", field: "DIV_CD" },
  { type: "text", headerName: "LBL_DIVISION_NAME", field: "DIV_NM" },
  { type: "text", headerName: "LBL_DEPARTURE_CODE", field: "FRM_LOC_CD" },
  { type: "text", headerName: "LBL_DEPARTURE_NAME", field: "FRM_LOC_NM" },
  { type: "text", headerName: "LBL_DESTINATION_CODE", field: "TO_LOC_CD" },
  { type: "text", headerName: "LBL_DESTINATION_NAME", field: "TO_LOC_NM" },
  {
    type: "text",
    headerName: "LBL_TZ_DIST",
    field: "DIST",
  },
  {
    type: "text",
    headerName: "LBL_TZ_DIST_TMAP",
    field: "TMAP_DIST",
  },
  {
    type: "text",
    headerName: "LBL_TRANSIT_TIME",
    field: "TRANSITTIME",
  },
  {
    type: "text",
    headerName: "LBL_EXP_TOLL_RATE",
    field: "RATE",
  },
  {
    type: "text",
    headerName: "LBL_ROUTE_SEARCH_OPTION",
    field: "MAP_RTNG_OPTN_TCD",
    codeKey: "mapRtngOptnTcd",
  },
  { type: "text", headerName: "LBL_CHG_REASON", field: "CHG_RSN" },
  { type: "text", headerName: "LBL_REMARK", field: "RMK" },
  {
    type: "text",
    headerName: "LBL_PRCS_STS",
    field: "DTTO_PRCS_STS",
    codeKey: "dttoPrcsStatus",
  },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
  { type: "text", headerName: "LBL_DTTO_BASE_TIME", field: "BASE_TIME" },
];

// 이력 그리드 (DistanceTransitTimeSub01)
export const HISTORY_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_TZ_DIST",
    field: "DIST",
    valueFormatter: numberValueFormatter,
  },
  {
    type: "text",
    headerName: "LBL_TZ_DIST_TMAP",
    field: "TMAP_DIST",
    valueFormatter: numberValueFormatter,
  },
  {
    type: "text",
    headerName: "LBL_TRANSIT_TIME",
    field: "TRANSITTIME",
    valueFormatter: numberValueFormatter,
  },
  {
    type: "text",
    headerName: "LBL_EXP_TOLL_RATE",
    field: "RATE",
    valueFormatter: numberValueFormatter,
  },
  { type: "text", headerName: "LBL_CHG_REASON", field: "CHG_RSN" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
  { type: "text", headerName: "LBL_DTTO_BASE_TIME", field: "BASE_TIME" },
];
