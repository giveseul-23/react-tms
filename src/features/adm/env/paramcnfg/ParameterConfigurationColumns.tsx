
export const MAIN_COLUMN_DEFS = [
  {
    headerName: "No",
  },
  {
    type: "text",
    headerName: "LBL_SYS_CNFG_CD",
    field: "SYS_CNFG_CD",
    editable: false,
    insertable: true,
    validators: { max: 20, required: true }
  },
  {
    type: "text",
    headerName: "LBL_SYS_CNFG_VAL",
    field: "SYS_CNFG_VAL",
    editable: true,
    insertable: true,
    validators: { max: 200, required: true }
  },
  {
    type: "text",
    headerName: "LBL_SYS_CNFG_DESC",
    field: "SYS_CNFG_DESC",
    editable: true,
    insertable: true,
    validators: { max: 200, required: true }
  },
  {
    type: "combo",
    headerName: "LBL_CNFG_USE_TP",
    field: "CNFG_USE_TP",
    codeKey: "cnfgUseTp",
    editable: true,
    insertable: true,
    required: true
  },
];
