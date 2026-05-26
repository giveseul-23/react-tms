export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_CMMN_CD",
    field: "CMMN_CD",
    editable: false,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_CMMN_NM",
    field: "CMMN_CD_NM",
    editable: true,
    insertable: true,
  },
  {
    type: "combo",
    headerName: "LBL_APPL_CD",
    field: "APPL_CD",
    codeKey: "applCodeList",
    editable: true,
    insertable: true,
  },
  {
    type: "check",
    headerName: "LBL_USE_YN",
    field: "USE_YN",
    editable: true,
    insertable: true,
  },
];

export const SUB01_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_CMMN_CD",
    field: "CMMN_CD",
    editable: false,
    insertable: false,
  },
  {
    type: "text",
    headerName: "LBL_DTL_CD",
    field: "CMMN_DTL_CD",
    editable: false,
    insertable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_ORDER_BY",
    field: "DSPLY_SEQ",
    editable: true,
    insertable: true,
  },
  {
    type: "check",
    headerName: "LBL_USE_YN",
    field: "USE_YN",
    editable: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_CMMN_CD_CNFG_VAL1",
    field: "CNFG_VAL1",
    editable: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_CMMN_CD_CNFG_VAL2",
    field: "CNFG_VAL2",
    editable: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_CMMN_CD_CNFG_VAL3",
    field: "CNFG_VAL3",
    editable: true,
    insertable: true,
  },
];

export const SUB02_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_CMMN_CD",
    field: "CMMN_CD",
    editable: false,
    insertable: false,
  },
  {
    type: "text",
    headerName: "LBL_DTL_CD",
    field: "CMMN_DTL_CD",
    editable: false,
    insertable: false,
  },
  {
    type: "combo",
    headerName: "LBL_LNG_PACK",
    field: "LANG_TP",
    codeKey: "codeLangList",
    editable: false,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_DTL_NM",
    field: "LANG_DESC",
    editable: true,
    insertable: true,
  },
];
