export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_FUEL_EFFICIENCY_ID",
    field: "FE_ID",
    isPrimaryKey: true,
    insertable: true,
    required: true,
  },
  {
    type: "date",
    headerName: "LBL_FROM_DATE",
    field: "FRM_DTTM",
    insertable: true,
    editable: true,
    required: true,
  },
  {
    type: "date",
    headerName: "LBL_TO_DATE",
    field: "TO_DTTM",
    insertable: true,
    editable: true,
    required: true,
  },
];

export const SUB01_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_FUEL_EFFICIENCY_ID",
    field: "FE_ID",
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
  },
];

export const SUB02_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_FUEL_EFFICIENCY_ID",
    field: "FE_ID",
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_VEHICLE_TYPE_CODE",
    field: "VEH_TP_CD",
    insertable: true,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_VEHICLE_TYPE_NAME",
    field: "VEH_TP_NM",
  },
  {
    type: "numeric",
    headerName: "LBL_FUEL_EFFICIENCY",
    field: "FUEL_EFFICIENCY",
    insertable: true,
    editable: true,
    required: true,
  },
];
