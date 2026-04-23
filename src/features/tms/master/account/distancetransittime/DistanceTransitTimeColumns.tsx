import { makeAuditColumns } from "@/app/components/grid/commonColumns";
import { numberValueFormatter } from "@/app/components/grid/commonFormatters";

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_DIVISION_CODE", field: "DIV_CD" },
  { headerName: "LBL_DIVISION_NAME", field: "DIV_NM" },
  { headerName: "LBL_DEPARTURE_CODE", field: "FRM_LOC_CD" },
  { headerName: "LBL_DEPARTURE_NAME", field: "FRM_LOC_NM" },
  { headerName: "LBL_DESTINATION_CODE", field: "TO_LOC_CD" },
  { headerName: "LBL_DESTINATION_NAME", field: "TO_LOC_NM" },
  {
    headerName: "LBL_TZ_DIST",
    field: "DIST",
  },
  {
    headerName: "LBL_TZ_DIST_TMAP",
    field: "TMAP_DIST",
  },
  {
    headerName: "LBL_TRANSIT_TIME",
    field: "TRANSITTIME",
  },
  {
    headerName: "LBL_EXP_TOLL_RATE",
    field: "RATE",
  },
  {
    headerName: "LBL_ROUTE_SEARCH_OPTION",
    field: "MAP_RTNG_OPTN_TCD",
    codeKey: "mapRtngOptnTcd",
  },
  { headerName: "LBL_CHG_REASON", field: "CHG_RSN" },
  { headerName: "LBL_REMARK", field: "RMK" },
  {
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
  { headerName: "LBL_DTTO_BASE_TIME", field: "BASE_TIME" },
];

// 이력 그리드 (DistanceTransitTimeSub01)
export const HISTORY_COLUMN_DEFS = [
  { headerName: "No" },
  {
    headerName: "LBL_TZ_DIST",
    field: "DIST",
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_TZ_DIST_TMAP",
    field: "TMAP_DIST",
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_TRANSIT_TIME",
    field: "TRANSITTIME",
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_EXP_TOLL_RATE",
    field: "RATE",
    valueFormatter: numberValueFormatter,
  },
  { headerName: "LBL_CHG_REASON", field: "CHG_RSN" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
  { headerName: "LBL_DTTO_BASE_TIME", field: "BASE_TIME" },
];
