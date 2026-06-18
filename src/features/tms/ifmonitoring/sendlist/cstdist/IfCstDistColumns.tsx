const ifPrcsStsCellStyle = (p: any): Record<string, string> => {
  const base = { textAlign: "center" as const };
  switch (String(p?.data?.IF_PRCS_STS ?? "").trim()) {
    case "S":
      return { ...base, backgroundColor: "#D9F0A6", fontWeight: "bold" };
    case "R":
      return { ...base, backgroundColor: "#F0CFA6" };
    case "E":
      return { ...base, backgroundColor: "red", color: "#FFFF00" };
    default:
      return base;
  }
};

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_INTERFAE_ID",
    field: "IF_ID",
    width: 100,
    align: "center",
  },
  {
    type: "combo",
    headerName: "LBL_PRCS_STS",
    field: "IF_PRCS_STS",
    codeKey: "interfaceStatus",
    width: 70,
    headerClass: "ag-header-center",
    cellStyle: ifPrcsStsCellStyle,
  },
  {
    type: "combo",
    headerName: "LBL_PRCS_MSG",
    field: "IF_PRCS_MSG_CD",
    codeKey: "interfaceMessage",
    width: 350,
    align: "left",
  },
  {
    type: "text",
    headerName: "LBL_PRCS_MSG_DESC",
    field: "IF_PRCS_MSG_DESC",
    width: 250,
  },
  {
    type: "combo",
    headerName: "LBL_SETL_TP",
    field: "CST_DIST_DATA_TCD",
    codeKey: "cstDistDataTcd",
    width: 200,
  },
  {
    type: "text",
    headerName: "LBL_DURATION",
    field: "DURATION",
    width: 200,
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_CUSTOMER_CODE",
    field: "CUST_CD",
    width: 200,
    align: "center",
  },
  {
    type: "numeric",
    headerName: "LBL_DISPATCH_NO",
    field: "DSPCH_NO",
    width: 200,
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_DOC_NO",
    field: "DOC_NO",
    width: 200,
  },
  {
    type: "text",
    headerName: "LBL_INSERT_PERSON_ID",
    field: "CRE_USR_ID",
    width: 130,
    align: "center",
  },
  {
    type: "datetime",
    headerName: "LBL_INSERT_DATE",
    field: "CRE_DTTM",
    width: 150,
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_UPDATE_PERSON_ID",
    field: "UPD_USR_ID",
    width: 150,
    align: "center",
  },
  {
    type: "datetime",
    headerName: "LBL_UPDATE_TIME",
    field: "UPD_DTTM",
    width: 150,
    align: "center",
  },
];

export const SUB01_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_INTERFAE_ID",
    field: "IF_ID",
    width: 100,
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_ACC_CRE_USR_ID",
    field: "CRE_USR_ID",
    width: 100,
    align: "center",
  },
  {
    type: "date",
    headerName: "LBL_POSTING_DT",
    field: "POSTING_DT",
    width: 100,
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_RVS_DOC_NO",
    field: "RVS_DOC_NO",
    width: 100,
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_SALES_NO",
    field: "SALES_NO",
    width: 100,
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_SALES_LINE_NO",
    field: "SALES_LINE_NO",
    width: 100,
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_CURRENCY",
    field: "CURRENCY",
    width: 100,
    align: "center",
  },
  {
    type: "numeric",
    headerName: "LBL_DTL_DIST_CST",
    field: "DTL_DIST_COST",
    width: 100,
    align: "right",
    summable: true,
  },
  {
    type: "text",
    headerName: "LBL_SALES_OFC_CD",
    field: "SALES_OFC",
    width: 100,
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_SALES_GRP_CD",
    field: "SALES_GRP",
    width: 100,
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_SALES_ORG_CD",
    field: "SALES_ORG_CD",
    width: 100,
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_DISTBUTE_CHANNEL",
    field: "DIST_CHANNEL",
    width: 100,
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_SOLD_TO_CD",
    field: "SOLD_TO_CD",
    width: 100,
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_ITEM_CD",
    field: "ITEM_CD",
    width: 100,
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_PLANT_CD",
    field: "PLANT_CD",
    width: 100,
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_CUST_CD_FOR_CENTER",
    field: "SHIP_TO_CD",
    width: 100,
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_PAS_NO",
    field: "PAS_NO",
    width: 100,
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_SLOC_CD",
    field: "SLOC_CD",
    width: 100,
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_CRE_USR_ID",
    field: "CRE_USR_ID",
    width: 100,
    align: "center",
  },
  {
    type: "datetime",
    headerName: "LBL_CRE_DTTM",
    field: "CRE_DTTM",
    width: 150,
    align: "center",
  },
];
