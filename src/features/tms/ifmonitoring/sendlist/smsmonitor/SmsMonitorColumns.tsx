import { Lang } from "@/app/services/common/Lang";

const interfaceStatusCellStyle = (p: any): Record<string, string> => {
  const base = { textAlign: "center" as const };
  switch (String(p?.data?.TRGT_SYS_SND_STTS ?? "").trim()) {
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
    type: "datetime",
    headerName: "LBL_SEND_SMS_DTTM",
    field: "TRGT_SYS_SND_DTTM",
    align: "center",
    editable: false,
  },
  {
    type: "text",
    headerName: Lang.get("LBL_SMS") + Lang.get("LBL_ID"),
    noLang: true,
    field: "TXTMSG_ID",
    align: "center",
    editable: false,
  },
  {
    type: "combo",
    headerName: "LBL_PRCS_STS",
    field: "TRGT_SYS_SND_STTS",
    codeKey: "interfaceStatus",
    width: 70,
    headerClass: "ag-header-center",
    cellStyle: interfaceStatusCellStyle,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_PRCS_RST_MSG",
    field: "TRGT_SYS_SND_STTS_MSG_DESC",
    align: "center",
    editable: false,
  },
  {
    type: "text",
    headerName: Lang.get("LBL_RCV") + Lang.get("LBL_TEL_NO"),
    noLang: true,
    field: "DRVR_HP",
    align: "center",
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_TITLE",
    field: "TXT_SUBJECT",
    align: "center",
    editable: false,
  },
  {
    type: "text",
    headerName: "TTL_MSG",
    field: "TXT_MSG",
    align: "left",
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_DIVISION_CODE",
    field: "DIV_CD",
    align: "center",
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
    align: "center",
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_DISPATCH_NO",
    field: "DSPCH_NO",
    align: "center",
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_LOCATION_CODE",
    field: "LOC_CD",
    align: "center",
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_LOCATION_NAME",
    field: "LOC_NM",
    align: "left",
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_VEH_NO",
    field: "VEH_NO",
    align: "left",
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_DRVR_NM",
    field: "DRVR_NM",
    align: "center",
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_RECEIVER_NM",
    field: "RCV_NM",
    align: "left",
    editable: false,
  },
  {
    type: "datetime",
    headerName: "LBL_CRE_DTTM",
    field: "CRE_DTTM",
    width: 150,
    align: "center",
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_INSERT_PERSON_ID",
    field: "CRE_USR_ID",
    width: 150,
    align: "center",
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_UPDATE_PERSON_ID",
    field: "UPD_USR_ID",
    width: 150,
    align: "center",
    editable: false,
  },
  {
    type: "datetime",
    headerName: "LBL_UPDATE_TIME",
    field: "UPD_DTTM",
    width: 150,
    align: "center",
    editable: false,
  },
];
