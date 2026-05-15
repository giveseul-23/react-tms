// 컬럼 끝의 standardAudit 은 DataGrid 가 audit prop(model.bind 자동) 으로 추가.

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_COUNTRY_CODE",
    field: "CTRY_CD",
    editable: true, insertable: true,
    isPrimaryKey: true,
  },
  {
    type: "text",
    headerName: "LBL_COUNTRY_NAME",
    field: "CTRY_NM",
    editable: true, insertable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_STANDARD_LAT",
    field: "LAT",
    editable: true, insertable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_STANDARD_LON",
    field: "LON",
    editable: true, insertable: true,
  },
  {
    type: "check",
    headerName: "LBL_ZIP_REQ_YN",
    field: "MSK_USE_YN",
    editable: true, insertable: true,
  },
  {
    type: "combo",
    headerName: "LBL_ROUTE",
    field: "MAP_TP",
    codeKey: "mapTpList",
    editable: true, insertable: true,
  },
  {
    type: "combo",
    headerName: "LBL_CTRY_TZ_TCD",
    field: "CTRY_TZ_TCD",
    codeKey: "ctryTzTcdList",
    editable: true, insertable: true,
  },
  {
    type: "combo",
    headerName: "LBL_CTRY_TZ",
    field: "CTRY_TZ",
    codeKey: "timezoneStore",
    editable: true, insertable: true,
  },
];

export const STATE_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_COUNTRY_CODE",
    field: "CTRY_CD",
    isPrimaryKey: true,
  },
  {
    type: "text",
    headerName: "LBL_STATE_CODE",
    field: "STT_CD",
    editable: true, insertable: true,
    isPrimaryKey: true,
  },
  {
    type: "text",
    headerName: "LBL_STATE_NAME",
    field: "STT_NM",
    editable: true, insertable: true,
  },
];

export const ZIP_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_COUNTRY_CODE", field: "CTRY_CD" },
  {
    type: "text",
    headerName: "LBL_ZIP_MASK",
    field: "MSK_VAL",
    editable: true, insertable: true,
  },
  { type: "check", headerName: "LBL_USE_YN", field: "USE_YN", editable: true, insertable: true },
];

export const CITY_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_COUNTRY_CODE", field: "CTRY_CD" },
  { type: "text", headerName: "LBL_STATE_CODE", field: "STT_CD" },
  {
    type: "text",
    headerName: "LBL_CITY_CODE",
    field: "CTY_CD",
    editable: true, insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_CITY_NAME",
    field: "CTY_NM",
    editable: true, insertable: true,
  },
];
