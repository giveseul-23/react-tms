export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_CUSTOMER_CODE",
    field: "CUST_CD",
    align: "center",
  },
  {
    type: "combo",
    headerName: "LBL_ACCOUNTS_RECEIVABLE_TARIFF_LEVEL_CODE",
    field: "AR_TRF_LCD",
    codeKey: "arTrfLevelList",
    width: 120,
  },
  {
    type: "text",
    headerName: "LBL_CUSTOMER_CONTRACT_CODE",
    field: "CUST_CNTRCT_CD",
  },
  {
    type: "text",
    headerName: "LBL_CUSTOMER_CONTRACT_NAME",
    field: "CUST_CNTRCT_NM",
  },{
    type: "text",
    headerName: "LBL_ACCOUNTS_RECEIVABLE_TARIFF_CODE",
    field: "AR_TRF_CD",
  }, {
    type: "text",
    headerName: "LBL_ACCOUNTS_RECEIVABLE_TARIFF_NAME",
    field: "AR_TRF_NM",
  }, {
    type: "number",
    headerName: "LBL_CAL_RNK",
    field: "CALC_RNK",
  }, {
    type: "popup",
    headerName: "LBL_RATE_ITEM_CODE",
    field: "AR_CHG_CD",
    nameField: "AR_CHG_NM",
    sqlId: "selectArChgCodeName",
    popupTitle: "LBL_RATE_ITEM_CODE",
    required: true,
    insertable: true,
  }, {
    type: "text",
    headerName: "LBL_RATE_ITEM_NAME",
    field: "AR_CHG_NM",
  }, {
    type: "check",
    headerName: "LBL_SUPERSEDE_YN",
    field: "SUPERSEDE_YN",
    editable: true,
    insertable: true,
    defaultValue: "N",
    width: 70,
    cellStyle: { textAlign: "center" },
    onCellValueChanged: (params) => {
      const checked = params.data.SUPERSEDE_YN;
      if (checked === "N" || checked === false) {
          const tcd = params.data.SUPERSEDE_TCD;
          if (tcd != null && String(tcd) !== "") params.node.setDataValue("SUPERSEDE_TCD", "");
      }
    }
  }, {
    type: "combo",
    headerName: "LBL_SUPERSEDE_TP",
    field: "SUPERSEDE_TCD",
    codeKey: "supersedeTpList",
    align: "center",
    insertable: true,
    editable: (params) => {
        return params.data?.SUPERSEDE_YN === "Y";
    },
    cellStyle: (params) => {
        const enabled = params.data?.SUPERSEDE_YN === "Y";
        return {
            textAlign: "center",
            backgroundColor: enabled ? undefined : "#f0f0f0",
            color: enabled ? undefined : "#999999"
        };
    },
    validator: (value, rowData) => {
        const yn = rowData?.SUPERSEDE_YN;
        if (!(yn === "Y" || yn === true)) {
            return true;
        }
        if (value == null || String(value).trim() === "") {
            return "MSG_SUPERSEDE_CHECK";
        }
        return true;
    }
  }, {
    type: "combo",
    headerName: "LBL_RDNG_RCD",
    field: "RDNG_RCD",
    codeKey: "rdngRcdList",
    align: "center",
    insertable: true,
    required: true,
    insertDefaultValue: "0300",
  }, {
    type: "combo",
    headerName: "LBL_USE_YN",
    field: "USE_YN",
    codeKey: "ynList",
    insertable: true,
    editable: true,
    required: true
  }
];

export const SUB01_COLUMN_DEFS = [
  {
    type: "number",
    headerName: "LBL_CAL_RNK",
    field: "CALC_RNK",
  }, {
    type: "text",
    headerName: "LBL_CAL_OPT_FROM",
    field: "FNT_OPR",
  },{
    type: "text",
    headerName: "LBL_COST_CD",
    field: "COST_CD",
  }, {
    type: "text",
    headerName: "LBL_COST_NM",
    field: "COST_NM",
  }, {
    type: "text",
    headerName: "LBL_CAL_OPT_TO",
    field: "END_OPR",
  }
];

