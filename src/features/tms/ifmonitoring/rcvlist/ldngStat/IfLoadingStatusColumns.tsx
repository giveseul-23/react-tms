// 적재상태 인터페이스 모니터링 — 단일 그리드. 조회 전용(편집 없음). audit 컬럼 OMIT.

// 처리상태(IF_PRCS_STS) 셀 색상 — 서버 setInterfaceProcessStatusColor 대응
const STATUS_CELL_STYLE = (params: any) => {
  const base = { textAlign: "center" as const };
  switch (String(params.value ?? "").trim()) {
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

// 사용자재처리여부(RE_PRCS_BY_USR_YN) 셀 색상 — 서버 setInterfaceRePrcsColor 대응
const REPRCS_YN_CELL_STYLE = (params: any) =>
  String(params.value ?? "").trim() === "Y"
    ? { textAlign: "center" as const, backgroundColor: "#BBE6F6" }
    : { textAlign: "center" as const };

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
    cellStyle: REPRCS_YN_CELL_STYLE,
  },
  {
    type: "combo",
    headerName: "LBL_PRCS_STS",
    field: "IF_PRCS_STS",
    codeKey: "interfaceStatus",
    width: 70,
    align: "center",
    cellStyle: STATUS_CELL_STYLE,
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
  {
    type: "text",
    headerName: "LBL_ORDER_NO",
    field: "ORD_NO",
    align: "center",
  },
  {
    type: "date",
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
  {
    type: "text",
    headerName: "LBL_TMS_IF_PRCS_ID",
    field: "TMS_IF_PRCS_ID",
    width: 150,
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_TMS_IF_PRCS_START_DTTM",
    field: "TMS_IF_PRCS_START_DTTM",
    width: 200,
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_TMS_IF_PRCS_END_DTTM",
    field: "TMS_IF_PRCS_END_DTTM",
    width: 200,
    align: "center",
  },
];
