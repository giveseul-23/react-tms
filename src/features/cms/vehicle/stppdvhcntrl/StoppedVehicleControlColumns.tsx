export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_LOG_TIME",
    field: "LOG_TIME",
    editable: false,
    insertable: false,
    cellStyle: { textAlign: "center" },
    flex: 1,
    minWidth: 70,    
  },
  {
    type: "numeric",
    headerName: "LBL_STOPPED_DSPCH_CNT",
    field: "STOPPED_DSPCH_CNT",
    editable: false,
    insertable: false,
    cellStyle: { textAlign: "right" },
    flex: 1,
    minWidth: 80,    
  },
];

export const SUB01_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP",
    field: "LGST_GRP_CD",
    flex: 1,
    minWidth: 80,  
    cellStyle: { textAlign: "center" },
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP",
    field: "LGST_GRP_NM",
    flex: 1,
    minWidth: 90,  
    cellStyle: { textAlign: "left" },
  },
  {
    type: "numeric",
    headerName: "LBL_STOPPED_DSPCH_CNT",
    field: "STOPPED_DSPCH_CNT",
    flex: 1,
    minWidth: 70,  
    cellStyle: { textAlign: "left" },
  },
];

export const SUB02_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_LOG_TIME",
    field: "LOG_TIME",
    cellStyle: { textAlign: "center" },
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_NM",
    cellStyle: { textAlign: "left" },
  },
  {
    type: "date",
    headerName: "LBL_DLVRY_DATE",
    field: "LBL_DLVRY_DATE",
    cellStyle: { textAlign: "center" },    
  },
  {
    type: "text",
    headerName: "LBL_VEH_NO",
    field: "VEH_NO",
  },
  { type: "text", headerName: "LBL_DRIVER_NAME", field: "DRVR_NM" },
  { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO" },
  { type: "text", headerName: "LBL_LANE", field: "STOP_LIST" },
  { type: "text", headerName: "LBL_REST_START_TIME", field: "REST_START_TIME" },
  { type: "text", headerName: "LBL_DETAIL_ID", field: "LOG_DTL_ID" },

];

export const SUB03_COLUMN_DEFS = [
 { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_LOG_TIME",
    field: "LOG_TIME",
    cellStyle: { textAlign: "center" },
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_NM",
    cellStyle: { textAlign: "left" },
  },
  {
    type: "date",
    headerName: "LBL_DLVRY_DATE",
    field: "LBL_DLVRY_DATE",
    cellStyle: { textAlign: "center" },    
  },
  {
    type: "text",
    headerName: "LBL_VEH_NO",
    field: "VEH_NO",
  },
  { type: "text", headerName: "LBL_DRIVER_NAME", field: "DRVR_NM" },
  { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO" },
  { type: "text", headerName: "LBL_LANE", field: "STOP_LIST" },
  { type: "text", headerName: "LBL_REST_START_TIME", field: "REST_START_TIME" },
  { type: "text", headerName: "LBL_DETAIL_ID", field: "LOG_DTL_ID" },

];
