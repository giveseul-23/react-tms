export const MAIN_COLUMN_DEFS = [
  { headerName: "No" }, // 자동 일련번호
  {
    type: "text",
    headerName: "LBL_RATE_ITEM_CD",
    field: "CHG_CD",
    insertable: true,
    validators: {
      required: true,
      regexTp: "GCODE",
    },
  },
  {
    type: "text",
    headerName: "LBL_RATE_ITEM_NAME",
    field: "CHG_NM",
    insertable: true,
    editable: true,
    validators: {
      required: true,
    },
  },
  {
    type: "check",
    headerName: "LBL_RATE_BASED_CALC_FLAG",
    field: "RATE_BASED_CALC_FLAG",
    insertable: true,
    editable: true,
  },
  {
    type: "check",
    headerName: "LBL_CARR_RATE_BKNG_ALLWD_YN",
    field: "ALW_CARR_RATE_BKNG_YN",
    insertable: true,
    editable: true,
  },
  {
    type: "check",
    headerName: "LBL_INSRNC_CHG_YN",
    field: "INSRNC_CHG_YN",
    insertable: true,
    editable: true,
  },
]