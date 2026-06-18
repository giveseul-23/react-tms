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
    headerName: "LBL_INTERFAE_ID",
    field: "IF_ID",
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
    type: "text",
    headerName: "LBL_USR_RE_PRCS_YN",
    field: "RE_PRCS_BY_USR_YN",
    width: 130,
    headerClass: "ag-header-center",
    cellStyle: rePrcsCellStyle,
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
    width: 180,
  },
  {
    type: "combo",
    headerName: "LBL_INV_SYS_ID",
    field: "TO_SYS_CD",
    codeKey: "invSysList",
    width: 140,
    align: "center",
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
    headerName: "LBL_CUSTOMER_CODE",
    field: "CUST_CD",
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_VEHICLE_CODE",
    field: "VEH_ID",
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_VEH_NO",
    field: "VEH_NO",
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_VEH_TP_CD",
    field: "VEH_TP_CD",
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_VEH_TP_NM",
    field: "VEH_TP_NM",
    align: "left",
  },
  {
    type: "combo",
    headerName: "LBL_VEH_GRP",
    field: "VEH_GRP_CD",
    codeKey: "vehGrpCd",
    align: "left",
  },
  {
    type: "text",
    headerName: "LBL_DRIVER_NAME",
    field: "DRVR_NM",
    align: "left",
  },
  {
    type: "text",
    headerName: "LBL_DRIVER_TEL",
    field: "DRVR_HP",
    align: "center",
  },
  {
    type: "check",
    headerName: "LBL_SIGNATURE_YN",
    field: "SIGNATURE_YN",
    align: "center",
  },
  {
    type: "check",
    headerName: "LBL_SEAL_YN",
    field: "SEAL_YN",
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_LIVESTOCK_VEHICLE_NO",
    field: "LIVESTOCK_VEHICLE_NO",
    align: "left",
  },
  {
    type: "text",
    headerName: "LBL_CARRIER_CODE",
    field: "CARR_CD",
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_CARRIER_NAME",
    field: "CARR_NM",
    align: "left",
  },
  {
    type: "text",
    headerName: "LBL_PLANT_CD",
    field: "PLANT_CD",
    align: "left",
  },
  {
    type: "text",
    headerName: "LBL_RFID",
    field: "RFID",
    align: "left",
  },
  {
    type: "numeric",
    headerName: "LBL_EMPTY_VEH_WGT",
    field: "EMPTY_VEH_WGT",
    align: "right",
  },
  {
    type: "numeric",
    headerName: "LBL_MAX_WGT",
    field: "MAX_WGT",
    align: "right",
  },
  {
    type: "combo",
    headerName: "LBL_VEH_OPER_SCD",
    field: "VEH_OPER_SCD",
    codeKey: "vehOperScd",
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_STORE_NM",
    field: "STORE_NM",
    align: "left",
  },
  {
    type: "combo",
    headerName: "LBL_VEH_DISPATCH_TP",
    field: "VEH_DISPATCH_TP",
    codeKey: "vehDspchTp",
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
