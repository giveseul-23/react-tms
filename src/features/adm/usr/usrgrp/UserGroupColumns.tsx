export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_USR_GRP_CD",
    field: "USR_GRP_CD",
    editable: false,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_USR_GRP_NM",
    field: "USR_GRP_NM",
    editable: true,
    insertable: true,
  },
  {
    type: "check",
    headerName: "LBL_ALLOW_EXTERNAL_CONN",
    field: "EXT_CONN_YN",
    editable: true,
    insertable: true,
    hidden: true,
  },
];

export const SUB01_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_USR_GRP_CD",
    field: "USR_GRP_CD",
    editable: false,
    insertable: false,
  },
  {
    type: "text",
    headerName: "LBL_APPL_CD",
    field: "APPL_CD",
    editable: false,
    insertable: false,
  },
  {
    type: "text",
    headerName: "LBL_APPL_NM",
    field: "APPL_NM",
    editable: false,
    insertable: false,
  },
];

export const SUB02_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_USR_GRP_CD",
    field: "USR_GRP_CD",
    editable: false,
    insertable: false,
  },
  {
    type: "text",
    headerName: "LBL_USER_ID",
    field: "USR_ID",
    editable: false,
    insertable: false,
  },
  {
    type: "text",
    headerName: "LBL_USER_NAME",
    field: "USR_NM",
    editable: false,
    insertable: false,
  },
  {
    type: "date",
    headerName: "LBL_VALID_START_DATE",
    field: "USE_STT_DT",
    editable: false,
    insertable: false,
  },
  {
    type: "date",
    headerName: "LBL_VALID_EXPIRATION_DATE",
    field: "USE_END_DT",
    editable: false,
    insertable: false,
  },
];

export const SUB03_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_USR_GRP_CD",
    field: "USR_GRP_CD",
    editable: false,
    insertable: false,
  },
  {
    type: "text",
    headerName: "LBL_RL_CD",
    field: "RL_CD",
    editable: false,
    insertable: false,
  },
  {
    type: "text",
    headerName: "LBL_RL_NM",
    field: "RL_NM",
    editable: false,
    insertable: false,
  },
];
