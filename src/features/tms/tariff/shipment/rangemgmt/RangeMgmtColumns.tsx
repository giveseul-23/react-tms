export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_RNG_CD",
    field: "RNG_CD",
    isPrimaryKey: true,
    insertable: true,
    validators: {
      required: true,
    },
  },
  {
    type: "text",
    headerName: "LBL_RNG_NM",
    field: "RNG_NM",
    insertable: true,
    editable: true,
    validators: {
      required: true,
    },
  },
];

export const DETAIL_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "RNG_DTL_ID",
    field: "RNG_DTL_ID",
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_RNG_CD",
    field: "RNG_CD",
    hide: true,
  },
  {
    type: "numeric",
    headerName: "LBL_RNG_SEQ",
    field: "RNG_SEQ",
  },
  {
    type: "numeric",
    headerName: "LBL_RNG_TO_VALUE",
    field: "RNG_TO_VAL",
    insertable: true,
    editable: true,
    validators: {
      required: true,
    },
  },
  {
    type: "combo",
    headerName: "LBL_RNG_CALC_TCD",
    field: "RNG_CALC_TCD",
    codeKey: "rngCalcTcd",
    insertable: true,
    editable: true,
    validators: {
      required: true,
    },
  },
  {
    type: "check",
    headerName: "LBL_RNG_SPLT_YN",
    field: "RNG_SPLT_YN",
    insertable: true,
    editable: true,
  },
];
