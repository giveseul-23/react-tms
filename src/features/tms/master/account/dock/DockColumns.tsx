// 도크관리 컬럼 정의 (서버 DockMain / DockSubGrid01 기준)
// audit 컬럼(삭제/상태/등록자·등록일시/수정자·수정일시)은 DataGrid 가 자동 추가(model.bind).

// 운영시간 HHMM → HH:MM 표시 (서버 onRenderer 대응)
const hhmmFormatter = (p: any) => {
  const v = String(p?.value ?? "");
  if (!v) return "";
  if (v.length > 4) return v.substring(0, 5);
  if (v.length < 4) return v;
  return v.substring(0, 2) + ":" + v.substring(2);
};

// 운영시간 셀 공통 (4자리 숫자 HHMM)
const timeCol = (headerName: string, field: string) => ({
  type: "text" as const,
  headerName,
  field,
  align: "center" as const,
  width: 90,
  insertable: true,
  editable: true,
  valueFormatter: hhmmFormatter,
  validators: {
    required: true,
    max: 4,
    regex: /^\d{4}$/,
    regexText: "MSG_ONLY_NUMBER_ALLOWED",
  },
});

// 요일별 From/To 그룹 컬럼 (일~토)
const dayGroup = (headerName: string, openField: string, closeField: string) => ({
  headerName,
  children: [
    timeCol("LBL_FROM", openField),
    timeCol("LBL_TO", closeField),
  ],
});

// ── 메인: 도크 ────────────────────────────────────────────────────
export const MAIN_COLUMN_DEFS = [
  // PK — 운영시간ID (화면 숨김)
  { field: "BSNS_HRS_ID", hide: true, isPrimaryKey: true },
  { headerName: "No" },
  // 도크ID (수정/추가 모두 잠금)
  { type: "text", headerName: "LBL_DOCK_ID", field: "DOCK_ID", align: "center", width: 110 },
  // 도크코드 — 추가 시 입력(GCODE), 기존 행 잠금
  {
    type: "text",
    headerName: "LBL_DOCK_CD",
    field: "DOCK_CD",
    align: "left",
    width: 140,
    insertable: true,
    validators: { required: true, regexTp: "GCODE" },
  },
  // 도크설명
  {
    type: "text",
    headerName: "LBL_DOCK_DESC",
    field: "DOCK_DESC",
    align: "left",
    width: 180,
    insertable: true,
    editable: true,
    validators: { required: true },
  },
  // 도크유형
  {
    type: "combo",
    headerName: "LBL_DOCK_TCD",
    field: "DOCK_TCD",
    codeKey: "dockTcd",
    align: "center",
    width: 130,
    insertable: true,
    editable: true,
    validators: { required: true },
  },
  // 확약단위시간
  {
    type: "numeric",
    headerName: "LBL_CMMT_UNIT_TM",
    field: "CMMT_UNIT_TM",
    width: 120,
    insertable: true,
    editable: true,
    defaultValue: 10,
    validators: { required: true, min: 1, max: 999 },
  },
  // 최대허용시간
  {
    type: "numeric",
    headerName: "LBL_ALWD_MAX_CMMT_TM",
    field: "ALW_MAX_CMMT_TM",
    width: 120,
    insertable: true,
    editable: true,
    defaultValue: 120,
    validators: { required: true, min: 1, max: 999 },
  },
  // 착지코드 — 추가 시 팝업 선택, 기존 행 잠금
  {
    type: "popup",
    headerName: "LBL_LOCATION_CODE",
    field: "LOC_CD",
    nameField: "LOC_NM",
    sqlId: "selectLocationCodeName",
    popupTitle: "LBL_LOCATION_CODE",
    align: "center",
    width: 120,
    insertable: true,
    validators: { required: true },
  },
  // 착지명 (표시 전용)
  {
    type: "text",
    headerName: "LBL_LOCATION_NAME",
    field: "LOC_NM",
    align: "left",
    width: 140,
    validators: { required: true },
  },
  // 사용여부
  {
    type: "check",
    headerName: "LBL_USE_YN",
    field: "USE_YN",
    align: "center",
    width: 60,
    insertable: true,
    editable: true,
    defaultValue: "Y",
  },
];

// ── sub01: 운영시간 슬롯 (요일별 From/To) ──────────────────────────
export const SUB01_COLUMN_DEFS = [
  // PK — 운영시간ID (화면 숨김)
  { field: "BSNS_HRS_ID", hide: true },
  // 운영슬롯 (잠금)
  { type: "text", headerName: "LBL_BSNS_HRS_SLOT_NO", field: "BSNS_HRS_SLOT_NO", align: "center", width: 120 },
  dayGroup("LBL_SUN_DAY", "OPEN_HR_SUN", "CLSE_HR_SUN"),
  dayGroup("LBL_MON_DAY", "OPEN_HR_MON", "CLSE_HR_MON"),
  dayGroup("LBL_TUES_DAY", "OPEN_HR_TUE", "CLSE_HR_TUE"),
  dayGroup("LBL_WEDS_DAY", "OPEN_HR_WED", "CLSE_HR_WED"),
  dayGroup("LBL_THUR_DAY", "OPEN_HR_THU", "CLSE_HR_THU"),
  dayGroup("LBL_FRI_DAY", "OPEN_HR_FRI", "CLSE_HR_FRI"),
  dayGroup("LBL_SAT_DAY", "OPEN_HR_SAT", "CLSE_HR_SAT"),
];
