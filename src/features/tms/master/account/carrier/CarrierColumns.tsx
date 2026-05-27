export const MAIN_COLUMN_DEFS = [
  { headerName: "No" }, // 자동 일련번호
  {
    type: "text",
    headerName: "LBL_CARRIER_CODE",
    field: "CARR_CD",
  },
  {
    type: "text",
    headerName: "LBL_CARRIER_NAME",
    field: "CARR_NM",
  },
  {
    type: "text",
    headerName: "LBL_ERP_BP_CODE",
    field: "ERP_BP_CD",
    hide: true
  },
  {
    type: "text",
    headerName: "LBL_REPRESENTITIVE",
    field: "REP_NM",
  },
  {
    type: "text",
    headerName: "LBL_REPRESENTATIVE_TEL",
    field: "REP_CNTC_NO",
  },
  {
    type: "text",
    headerName: "LBL_ADDR",
    field: "DTL_ADDR1",
  },
  {
    type: "text",
    headerName: "LBL_DETAIL_ADDRESS",
    field: "DTL_ADDR2",
  },
  {
    type: "text",
    headerName: "LBL_ZIP_CODE",
    field: "ZIP_CD",
  },
  {
    type: "float",
    headerName: "LBL_ZIP_REQ_YN",
    field: "CTRY_MSK_YN",
    hide: true
  },
]

export const BANK_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", 
    headerName: "LBL_BANK_ACCOUNT_ID", 
    field: "BANK_ACNT_ID" 
  },
  { type: "combo", 
    headerName: "LBL_BANK_KEY", 
    field: "BANK_KEY",
    codeKey: "bankKey"
  },
  { type: "text", 
    headerName: "LBL_ACNT_HOLDER", 
    field: "ACNT_HOLDER" 
  },
  { type: "text", 
    headerName: "LBL_BANK_ACCOUNT_DESCR", 
    field: "ACNT_DESCR_NM" 
  },
  { type: "text", 
    headerName: "LBL_CUSTOMER_CODE", 
    field: "CUST_CD" 
  },
  { type: "text", 
    headerName: "LBL_DFT_VAL_NM", 
    field: "DFT_YN" 
  },
];

export const COMP_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", 
    headerName: "LBL_CUSTOMER_CODE", 
    field: "CUST_CD" 
  },
  { type: "text", 
    headerName: "LBL_PAYMENT_TERM_CD", 
    field: "PAYMENT_TERM" 
  },
  { type: "text", 
    headerName: "LBL_PAYMENT_TERM_NM", 
    field: "PAYMENT_TERM_NM" 
  },
];