import { numberValueFormatter } from "@/app/components/grid/columns/commonFormatters";

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "popup",
    headerName: "LBL_DIVISION_CODE",
    field: "DIV_CD",
    nameField: "DIV_NM",
    sqlId: "selectDivisionCodeName",
    popupTitle: "LBL_DIVISION_CODE",
    required: true,
    insertable: true,
    callback: ({ commit }) => {
      commit({
        LGST_GRP_CD: "",
        LGST_GRP_NM: "",
        TRF_CD: "",
        TRF_NM: ""
      });
    },
  },
  {
    type: "text",
    headerName: "LBL_DIVISION_NAME",
    field: "DIV_NM",
  },
  {
    type: "popup",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
    nameField: "LGST_GRP_NM",
    sqlId: "selectLogisticsgroupCodeName",
    popupTitle: "LBL_LOGISTICS_GROUP_CODE",
    required: true,
    insertable: true,
    extraParams: (row) => ({
      keyParam: row?.DIV_CD ?? ""
    }),
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
  },
  {
    type: "popup",
    headerName: "LBL_TARIFF_CODE",
    field: "TRF_CD",
    nameField: "TRF_NM",
    sqlId: "selectTariffCodeName",
    popupTitle: "LBL_TARIFF_CODE",
    required: true,
    insertable: true,
    extraParams: (row) => ({
      param1: row?.DIV_CD ?? "",
      param2: row?.LGST_GRP_CD ?? "",
    }),
  },
  {
    type: "text",
    headerName: "LBL_TARIFF_NAME",
    field: "TRF_NM",
  },
  {
    type: "popup",
    headerName: "LBL_RATE_ITEM_CD",
    field: "CHG_CD",
    nameField: "CHG_NM",
    sqlId: "selectTariffChgCodeNameH2",
    popupTitle: "LBL_RATE_ITEM_CD",
    required: true,
    insertable: true,
    extraParams: (row) => ({
      keyParam: row?.TRF_CD ?? ""
    }),
  },
  {
    type: "text",
    headerName: "LBL_RATE_ITEM_NAME",
    field: "CHG_NM",
  },
  {
    type: "popup",
    headerName: "LBL_SERVICE_CD",
    field: "SUBCHG_CD",
    nameField: "SUBCHG_NM",
    sqlId: "selectSubchgCodeName",
    popupTitle: "LBL_SERVICE_CD",
    required: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_SERVICE_NM",
    field: "SUBCHG_NM",
  },
  {
    type: "numeric",
    headerName: "LBL_MIN_COST",
    field: "MIN_COST",
    editable: true,
    insertable: true,
    defaultValue: 0,
    valueFormatter: numberValueFormatter,
    validators: {
      min: 0,
      max: 999999999
    },
  },
  {
    type: "numeric",
    headerName: "LBL_MAX_COST",
    field: "MAX_COST",
    editable: true,
    insertable: true,
    defaultValue: 999999999,
    valueFormatter: numberValueFormatter,
    validators: {
      min: 0,
      max: 999999999
    },
  },
  {
    type: "numeric",
    headerName: "LBL_BASIC_COST",
    field: "BSE_COST",
    editable: true,
    insertable: true,
    defaultValue: 0,
    valueFormatter: numberValueFormatter,
    validators: {
      min: 0,
      max: 999999999
    },
  },
  {
    type: "check",
    headerName: "LBL_ACCM_SUM",
    field: "ACCM_SUM_YN",
    editable: true,
    insertable: true,
    defaultValue: "N",
  },
  {
    type: "check",
    headerName: "LBL_USE_YN",
    field: "USE_YN",
    editable: true,
    insertable: true,
    defaultValue: "Y",
  },
  {
    type: "numeric",
    headerName: "LBL_ORDER",
    field: "SEQ",
    required: true,
    editable: true,
    insertable: true,
    valueFormatter: numberValueFormatter,
    validators: {
      min: 0,
      max: 9999999999
    },
  },
  {
    type: "text",
    headerName: "LBL_COST_CD",
    field: "COST_CD",
    required: true,
    insertable: true,
    editable: false,
    validators: {
      max: 60
    },
  },
  {
    type: "text",
    headerName: "LBL_COST_NM",
    field: "COST_NM",
    required: true,
    editable: true,
    insertable: true,
    validators: {
      max: 200
    },
  },
  {
    type: "popup",
    headerName: "LBL_CLASS_CODE",
    field: "CLSS_CD",
    nameField: "CLSS_NM",
    sqlId: "selectClssCodeNameCostAP",
    popupTitle: "LBL_CLASS_CODE",
    required: true,
    editable: true,
    insertable: true,
    validators: { max: 60 },
  },
  {
    type: "text",
    headerName: "LBL_CLASS_NAME",
    field: "CLSS_NM",
  },
  {
    type: "combo",
    headerName: "LBL_COST_OPTION",
    field: "OPR",
    codeKey: "operatorTypeList",
    required: true,
    editable: true,
    insertable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_COST_UNIT",
    field: "ADJ_RT",
    required: true,
    editable: true,
    insertable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    type: "numeric",
    headerName: "LBL_COST",
    field: "COST",
    required: true,
    editable: true,
    insertable: true,
    valueFormatter: numberValueFormatter,
  },
];

export const CONDITION_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_TARIFF_CODE",
    field: "TRF_CD",
    hide: true
  },
  {
    type: "text",
    headerName: "LBL_RATE_ITEM_CD",
    field: "CHG_CD",
    hide: true
  },
  {
    type: "text",
    headerName: "LBL_SERVICE_CD",
    field: "SUBCHG_CD",
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_COST_CD",
    field: "COST_CD",
    hide: true
  },
  {
    type: "text",
    headerName: "LBL_ORDER",
    field: "ORG_SEQ",
    hide: true
  },
  {
    type: "numeric",
    headerName: "LBL_ORDER",
    field: "SEQ",
    required: true,
    editable: true,
    insertable: true,
    valueFormatter: numberValueFormatter,
    validators: {
      min: 0,
      max: 9999999999
    },
  },
  {
    type: "popup",
    headerName: "LBL_CLASS_CODE",
    field: "CLSS_CD",
    nameField: "CLSS_NM",
    sqlId: "selectClssCodeName",
    popupTitle: "LBL_CLASS_CODE",
    required: true,
    editable: true,
    insertable: true,
    validators: { max: 60 },
    callback: ({ picked, commit }) =>
      commit({
        CLSS_CD: picked.CODE,
        CLSS_NM: picked.NAME
      }),
  },
  {
    type: "text",
    headerName: "LBL_CLASS_NAME",
    field: "CLSS_NM",
  },
  {
    type: "combo",
    headerName: "LBL_CAL_OPTION",
    field: "OPR",
    codeKey: "calcOptTypeList",
    required: true,
    editable: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_OPT_VAL_FROM",
    field: "FRM_VAL",
    required: true,
    editable: true,
    insertable: true,
    validators: {
      max: 200
    },
  },
  {
    type: "text",
    headerName: "LBL_OPT_VAL_TO",
    field: "TO_VAL",
    editable: true,
    insertable: true,
    validators: {
      max: 200
    },
  },
  {
    type: "combo",
    headerName: "LBL_AND_OR",
    field: "LGC_OPR",
    codeKey: "operatorTypeList_AndOr",
    required: true,
    editable: true,
    insertable: true,
  },
];
