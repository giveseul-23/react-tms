import { makeAuditColumns } from "@/app/components/grid/commonColumns";

// 일일실적 (메인) 그리드
export const DAILY_MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_DLVRY_DATE", field: "DLVRY_DT" },
  { headerName: "LBL_FINANCIAL_STATUS", field: "AP_FI_STS", codeKey: "fiSts" },
  { headerName: "LBL_PAY_CARRIER", field: "PAY_CARR_NM" },
  { headerName: "LBL_VEHICLE_NUMBER", field: "VEH_NO" },
  { headerName: "LBL_DRIVER", field: "DRVR_NM" },
  {
    headerName: "LBL_WORK_TYPE_PLAN",
    field: "WORK_DAY_TP_PLN",
    codeKey: "workTp",
  },
  {
    headerName: "LBL_WORK_TYPE_EXE",
    field: "WORK_DAY_TP_EXE",
    codeKey: "workTpExe",
  },
  { headerName: "LBL_CAL_TCD", field: "CAL_TCD", codeKey: "calTcd" },
  {
    headerName: "LBL_DLY_SETL_STS",
    field: "DLY_SETL_STS",
    codeKey: "dlySetlSts",
  },
  { headerName: "LBL_FI_DIST_KM", field: "TTL_DIST" },
  { headerName: "LBL_AP_ID", field: "DLY_APPLN_ID" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// 상세내역 그리드
export const DAILY_DETAIL_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_DLVRY_DATE", field: "DLVRY_DT" },
  { headerName: "LBL_VEH_NO", field: "VEH_NO" },
  { headerName: "LBL_DRIVER_NAME", field: "DRVR_NM" },
  { headerName: "LBL_VEHICLE_TYPE_NAME", field: "VEH_TP_NM" },
  { headerName: "LBL_ROTATION", field: "RTN_NO" },
  { headerName: "LBL_PLN_DSPCH_ROUTE", field: "DSPCH_LOC_DROP" },
  { headerName: "LBL_FI_LOC_DROP", field: "FI_LOC_DROP" },
  {
    headerName: "KPP",
    children: [
      { headerName: "LBL_OUTBOUND", field: "P1_INBOUND" },
      { headerName: "LBL_INBOUND", field: "P1_OUTBOUND" },
    ],
  },
  {
    headerName: "LBL_AJU_PLT",
    children: [
      { headerName: "LBL_OUTBOUND", field: "P2_INBOUND" },
      { headerName: "LBL_INBOUND", field: "P2_OUTBOUND" },
    ],
  },
  {
    headerName: "LBL_ETC_SETTING_PLT",
    children: [
      { headerName: "LBL_OUTBOUND", field: "P3_INBOUND" },
      { headerName: "LBL_INBOUND", field: "P3_OUTBOUND" },
    ],
  },
  {
    headerName: "LBL_SLV_BOGIE",
    children: [
      { headerName: "LBL_OUTBOUND", field: "R1_INBOUND" },
      { headerName: "LBL_INBOUND", field: "R1_OUTBOUND" },
    ],
  },
  {
    headerName: "LBL_BLU_BOGIE",
    children: [
      { headerName: "LBL_OUTBOUND", field: "R2_INBOUND" },
      { headerName: "LBL_INBOUND", field: "R2_OUTBOUND" },
    ],
  },
  {
    headerName: "LBL_PICK_BOGIE",
    children: [
      { headerName: "LBL_OUTBOUND", field: "R3_INBOUND" },
      { headerName: "LBL_INBOUND", field: "R3_OUTBOUND" },
    ],
  },
  {
    headerName: "LBL_TRANSFER_BOGIE",
    children: [
      { headerName: "LBL_OUTBOUND", field: "O1_INBOUND" },
      { headerName: "LBL_INBOUND", field: "O1_OUTBOUND" },
    ],
  },
  {
    headerName: "LBL_LENDING_BORROWING",
    children: [
      { headerName: "LBL_OUTBOUND", field: "O2_INBOUND" },
      { headerName: "LBL_INBOUND", field: "O2_OUTBOUND" },
    ],
  },
  {
    headerName: "LBL_TRANSPORTATION",
    children: [
      { headerName: "LBL_OUTBOUND", field: "O3_INBOUND" },
      { headerName: "LBL_INBOUND", field: "O3_OUTBOUND" },
    ],
  },
  {
    headerName: "LBL_PICK_BOX_LENDING_BORROWING",
    children: [
      { headerName: "LBL_OUTBOUND", field: "O4_INBOUND" },
      { headerName: "LBL_INBOUND", field: "O4_OUTBOUND" },
    ],
  },
  {
    headerName: "LBL_PICK_BOX_TRANSPORTATION",
    children: [
      { headerName: "LBL_OUTBOUND", field: "O5_INBOUND" },
      { headerName: "LBL_INBOUND", field: "O5_OUTBOUND" },
    ],
  },
  { headerName: "LBL_TRIP_YN", field: "TRIP_YN" },
  { headerName: "LBL_APPROVED_ROTATION_COUNT", field: "APPROVAL_RTN_CNT" },
  { headerName: "LBL_DIST_KM", field: "TTL_DIST" },
  { headerName: "LBL_TRIP_NO", field: "TRIP_ID" },
  { headerName: "LBL_TRIP_SEQ", field: "TRIP_SEQ" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];
