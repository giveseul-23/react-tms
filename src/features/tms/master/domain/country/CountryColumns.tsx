import { standardAudit } from "@/app/components/grid/commonColumns";

export const MAIN_COLUMN_DEFS = (setGridData?: (updater: any) => void) => [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_COUNTRY_CODE",
    field: "CTRY_CD",
  },
  { type: "text", headerName: "LBL_COUNTRY_NAME", field: "CTRY_NM" },
  { type: "numeric", headerName: "LBL_STANDARD_LAT", field: "LAT" },
  { type: "numeric", headerName: "LBL_STANDARD_LON", field: "LON" },
  { type: "text", headerName: "LBL_ZIP_REQ_YN", field: "MSK_USE_YN" },
  {
    type: "text",
    headerName: "LBL_ROUTE",
    field: "MAP_TP",
    codeKey: "mapTpList",
  },
  {
    type: "text",
    headerName: "LBL_CTRY_TZ_TCD",
    field: "CTRY_TZ_TCD",
    codeKey: "ctryTzTcdList",
  },
  {
    type: "text",
    headerName: "LBL_CTRY_TZ",
    field: "CTRY_TZ",
    codeKey: "timezoneStore",
  },
  { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO" },
  ...standardAudit(setGridData),
];

// ── STATE_COLUMN_DEFS
export const STATE_COLUMN_DEFS = (setGridData?: (updater: any) => void) => [
  { headerName: "No" },
  { type: "text", headerName: "LBL_COUNTRY_CODE", field: "CTRY_CD" },
  { type: "text", headerName: "LBL_STATE_CODE", field: "STT_CD" },
  { type: "text", headerName: "LBL_STATE_NAME", field: "STT_NM" },
  ...standardAudit(setGridData),
];

// ── CITY_COLUMN_DEFS
export const ZIP_COLUMN_DEFS = (setGridData?: (updater: any) => void) => [
  { headerName: "No" },
  { type: "text", headerName: "LBL_COUNTRY_CODE", field: "CTRY_CD" },
  { type: "text", headerName: "LBL_ZIP_MASK", field: "MSK_VAL" },
  { type: "text", headerName: "LBL_USE_YN", field: "USE_YN" },
  ...standardAudit(setGridData),
];

// ── CITY_COLUMN_DEFS
export const CITY_COLUMN_DEFS = (setGridData?: (updater: any) => void) => [
  { headerName: "No" },
  { type: "text", headerName: "LBL_COUNTRY_CODE", field: "CTRY_CD" },
  { type: "text", headerName: "LBL_STATE_CODE", field: "STT_CD" },
  { type: "text", headerName: "LBL_CITY_CODE", field: "CTY_CD" },
  { type: "text", headerName: "LBL_CITY_NAME", field: "CTY_NM" },
  ...standardAudit(setGridData),
];
