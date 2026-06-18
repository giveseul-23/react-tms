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

const rePrcsCellStyle = (p: any): Record<string, string> => {
  const base = { textAlign: "center" as const };
  if (String(p?.data?.RE_PRCS_BY_USR_YN ?? "").trim() === "Y") {
    return { ...base, backgroundColor: "#BBE6F6" };
  }
  return base;
};

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "datetime",
    headerName: "LBL_SEND_DATE",
    field: "CRE_DTTM",
    width: 150,
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_USR_RE_PRCS_YN",
    field: "RE_PRCS_BY_USR_YN",
    width: 110,
    headerClass: "ag-header-center",
    cellStyle: rePrcsCellStyle,
  },
  {
    type: "text",
    headerName: "LBL_INTERFAE_ID",
    field: "IF_ID",
    width: 130,
    align: "center",
  },
  {
    type: "combo",
    headerName: "LBL_INTERFACE_TCD",
    field: "IF_TCD",
    codeKey: "interfaceType",
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
    type: "text",
    headerName: "LBL_PRCS_MSG",
    field: "IF_PRCS_MSG_DESC",
    width: 200,
  },
  {
    type: "combo",
    headerName: "LBL_IF_PRCS_MSG_CD",
    field: "IF_PRCS_MSG_CD",
    codeKey: "ifPrcsMsgCd",
    width: 150,
    align: "left",
  },
  {
    type: "text",
    headerName: "LBL_DIVISION_CODE",
    field: "DIV_CD",
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_CD",
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_DISPATCH_NO",
    field: "DSPCH_NO",
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_SOLD_TO_CD",
    field: "SOLD_TO_CD",
    width: 80,
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_SOLD_TO_NM",
    field: "SOLD_TO_NM",
    width: 80,
    align: "left",
  },
  {
    type: "date",
    headerName: "LBL_DSPCH_DLVRY_DT",
    field: "DLVRY_DT",
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_VEHICLE_NUMBER",
    field: "VEH_NO",
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_DRIVER_TEL",
    field: "MBL_PHN_NO",
    align: "center",
  },
  {
    type: "datetime",
    headerName: "LBL_ATD_TIME",
    field: "ATD_DTTM",
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_TMS_IF_PRCS_ID",
    field: "TMS_IF_PRCS_ID",
    width: 150,
    align: "center",
  },
  {
    type: "datetime",
    headerName: "LBL_TMS_IF_PRCS_START_DTTM",
    field: "TMS_IF_PRCS_START_DTTM",
    width: 200,
    align: "center",
  },
  {
    type: "datetime",
    headerName: "LBL_TMS_IF_PRCS_END_DTTM",
    field: "TMS_IF_PRCS_END_DTTM",
    width: 200,
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_INSERT_PERSON_ID",
    field: "CRE_USR_ID",
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
