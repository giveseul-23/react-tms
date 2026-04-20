import { makeAuditColumns } from "@/app/components/grid/commonColumns";

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    headerName: "LBL_COUNTRY_CODE",
    field: "CTRY_CD",
  },
  { headerName: "LBL_COUNTRY_NAME", field: "CTRY_NM" },
  { headerName: "LBL_STANDARD_LAT", field: "LAT" },
  { headerName: "LBL_STANDARD_LON", field: "LON" },
  { headerName: "LBL_ZIP_REQ_YN", field: "MSK_USE_YN" },
  {
    headerName: "LBL_ROUTE",
    field: "MAP_TP",
    codeKey: "mapTpList",
  },
  {
    headerName: "LBL_CTRY_TZ_TCD",
    field: "CTRY_TZ_TCD",
    codeKey: "ctryTzTcdList",
  },
  {
    headerName: "LBL_CTRY_TZ",
    field: "CTRY_TZ",
    codeKey: "timezoneStore",
  },
  { headerName: "LBL_VEH_NO", field: "VEH_NO" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// ── STATE_COLUMN_DEFS
export const STATE_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_COUNTRY_CODE", field: "CTRY_CD" },
  { headerName: "LBL_STATE_CODE", field: "STT_CD" },
  { headerName: "LBL_STATE_NAME", field: "STT_NM" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// ── CITY_COLUMN_DEFS
export const ZIP_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_COUNTRY_CODE", field: "CTRY_CD" },
  { headerName: "LBL_ZIP_MASK", field: "MSK_VAL" },
  { headerName: "LBL_USE_YN", field: "USE_YN" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// ── CITY_COLUMN_DEFS
export const CITY_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_COUNTRY_CODE", field: "CTRY_CD" },
  { headerName: "LBL_STATE_CODE", field: "STT_CD" },
  { headerName: "LBL_CITY_CODE", field: "CTY_CD" },
  { headerName: "LBL_CITY_NAME", field: "CTY_NM" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];
