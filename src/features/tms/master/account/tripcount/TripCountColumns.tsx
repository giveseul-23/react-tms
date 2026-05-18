export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_DEPARTURE_ID",
    field: "FRM_LOC_ID",
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_DEPARTURE_CODE",
    field: "FRM_LOC_CD",
    editable: true, insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_DEPARTURE_NAME",
    field: "FRM_LOC_NM",
  },
  {
    type: "text",
    headerName: "LBL_DESTINATION_ID",
    field: "TO_LOC_ID",
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_DESTINATION_CODE",
    field: "TO_LOC_CD",
    editable: true, insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_DESTINATION_NAME",
    field: "TO_LOC_NM",
  },
  {
    type: "numeric",
    headerName: "LBL_TRIP_COUNT",
    field: "TRIP_CNT",
    editable: true, insertable: true,
  },
];