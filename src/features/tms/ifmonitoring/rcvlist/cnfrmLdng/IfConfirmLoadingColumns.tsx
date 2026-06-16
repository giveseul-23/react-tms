// 그리드 컬럼 정의 (서버 IfConfirmLoadingMain 기준)
// 적재확정 IF 모니터링 — 전 컬럼 읽기전용(조회). audit 컬럼은 OMIT.

// 처리상태(IF_PRCS_STS) 셀 색상 (서버 ViewController.setInterfaceProcessStatusColor 대응)
const ifPrcsStsCellStyle = (p: any): Record<string, string> => {
  const base = { textAlign: "center" as const };
  const code = String(p?.data?.IF_PRCS_STS ?? "");
  switch (code) {
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

// 사용자재처리여부(RE_PRCS_BY_USR_YN) 셀 색상 (서버 setInterfaceRePrcsColor 대응)
const rePrcsCellStyle = (p: any): Record<string, string> => {
  const base = { textAlign: "center" as const };
  if (String(p?.data?.RE_PRCS_BY_USR_YN ?? "") === "Y") {
    return { ...base, backgroundColor: "#BBE6F6" };
  }
  return base;
};

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "datetime",
    headerName: "LBL_RECEIVE_DATE",
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
    align: "center",
    cellStyle: rePrcsCellStyle,
  },
  {
    type: "combo",
    headerName: "LBL_PRCS_STS",
    field: "IF_PRCS_STS",
    codeKey: "interfaceStatus",
    width: 70,
    align: "center",
    cellStyle: ifPrcsStsCellStyle,
  },
  {
    type: "text",
    headerName: "LBL_PRCS_MSG",
    field: "IF_PRCS_MSG_DESC",
    width: 180,
  },
  {
    type: "text",
    headerName: "LBL_FROM_SYSTEM_CODE",
    field: "FRM_SYS_CD",
    align: "center",
  },
  { type: "text", headerName: "LBL_ORDER_NO", field: "ORD_NO", align: "center" },
  {
    type: "text",
    headerName: "LBL_ORD_LINE_NO",
    field: "ORD_LINE_NO",
    width: 110,
    align: "center",
  },
  {
    type: "datetime",
    headerName: "LBL_DSPCH_DLVRY_DT",
    field: "DLVRY_DT",
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
    headerName: "LBL_VEHICLE_NUMBER",
    field: "VEH_NO",
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_DRIVER_NAME",
    field: "DRVR_NM",
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_DEPARTURE_CODE",
    field: "FRM_LOC_CD",
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_DEPARTURE_NAME",
    field: "FRM_LOC_NM",
    align: "left",
  },
  {
    type: "text",
    headerName: "LBL_DESTINATION_CD",
    field: "TO_LOC_CD",
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_DESTINATION_NM",
    field: "TO_LOC_NM",
    align: "left",
  },
  { type: "text", headerName: "LBL_ITEM_CD", field: "CUST_ITEM_CD", align: "left" },
  { type: "text", headerName: "LBL_ITEM_NM", field: "CUST_ITEM_NM", align: "left" },
  { type: "numeric", headerName: "LBL_CFM_QTY", field: "CFM_QTY", align: "right" },
  {
    type: "numeric",
    headerName: "LBL_CONFIRMED_WGT",
    field: "CFM_WGT",
    align: "right",
  },
  {
    type: "numeric",
    headerName: "LBL_CONFIRMED_VOL",
    field: "CFM_VOL",
    align: "right",
  },
  {
    type: "numeric",
    headerName: "LBL_CONFIRMED_FLEX_QTY1",
    field: "CFM_FLEX_QTY1",
    align: "right",
  },
  {
    type: "numeric",
    headerName: "LBL_CONFIRMED_FLEX_QTY2",
    field: "CFM_FLEX_QTY2",
    align: "right",
  },
  {
    type: "numeric",
    headerName: "LBL_CONFIRMED_FLEX_QTY3",
    field: "CFM_FLEX_QTY3",
    align: "right",
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
