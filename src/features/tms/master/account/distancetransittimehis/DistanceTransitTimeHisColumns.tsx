export const MAIN_COLUMN_DEFS = [
  { headerName: "No" }, // 자동 일련번호
  {
    type: "numeric",
    headerName: "LBL_CHG_SEQ",
    field: "SEQ",
  },
  {
    type: "text",
    headerName: "LBL_DIVISION_CODE",
    field: "DIV_CD",
  },
  {
    type: "text",
    headerName: "LBL_DIVISION_NAME",
    field: "DIV_NM",
    hide: true
  },
  {
    type: "text",
    headerName: "LBL_DEPARTURE_CODE",
    field: "FRM_LOC_CD",
  },
  {
    type: "text",
    headerName: "LBL_DEPARTURE_NAME",
    field: "FRM_LOC_NM",
  },
  {
    type: "text",
    headerName: "LBL_DESTINATION_CODE",
    field: "TO_LOC_ID",
    hide: true
  },
  {
    type: "text",
    headerName: "LBL_DESTINATION_CODE",
    field: "TO_LOC_CD",
  },
  {
    type: "text",
    headerName: "LBL_DESTINATION_NAME",
    field: "TO_LOC_NM",
  },
  {
    type: "float",
    headerName: "LBL_TZ_DIST",
    field: "DIST",
  },
  {
    type: "float",
    headerName: "LBL_TZ_DIST_TMAP",
    field: "TMAP_DIST",
  },
  {
    type: "numeric",
    headerName: "LBL_TRANSIT_TIME",
    field: "TRANSITTIME",
  },
  {
    type: "numeric",
    headerName: "LBL_EXP_TOLL_RATE",
    field: "RATE",
  },
  {
    type: "text",
    headerName: "LBL_CHG_REASON",
    field: "CHG_RSN",
  },
  {
    type: "text",
    headerName: "LBL_REMARK",
    field: "RMK",
  },
  {
    type: "text",
    headerName: "LBL_INSERT_PERSON_ID",
    field: "DTTO_CRE_USR_ID",
  },
  {
    type: "text",
    headerName: "LBL_INSERT_DATE",
    field: "DTTO_CRE_DTTM",
  },
  {
    type: "text",
    headerName: "LBL_UPDATE_PERSON_ID",
    field: "DTTO_UPD_USR_ID",
  },
  {
    type: "text",
    headerName: "LBL_UPDATE_TIME",
    field: "DTTO_UPD_DTTM",
  }
]

export const DETAIL_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "numeric", 
    headerName: "LBL_CHG_SEQ", 
    field: "SEQ" 
  },
  { type: "float", 
    headerName: "LBL_TZ_DIST", 
    field: "DIST" 
  },
  { type: "float", 
    headerName: "LBL_TZ_DIST_TMAP", 
    field: "TMAP_DIST" 
  },
  { type: "numeric", 
    headerName: "LBL_TRANSIT_TIME", 
    field: "TRANSITTIME" 
  },
  { type: "numeric", 
    headerName: "LBL_EXP_TOLL_RATE", 
    field: "RATE" 
  },
  { type: "text", 
    headerName: "LBL_CHG_REASON", 
    field: "CHG_RSN" 
  },
  { type: "text", 
    headerName: "LBL_INSERT_PERSON_ID", 
    field: "CRE_USR_ID" 
  },
  { type: "dateTime", 
    headerName: "LBL_INSERT_DATE", 
    field: "CRE_DTTM" 
  },
];