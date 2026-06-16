// 그리드 컬럼 정의 — audit 컬럼은 DataGrid 가 자동 추가(model.bind).

// 메인: 헬퍼 (서버 AssistMain)
export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    // 헬퍼 코드 (PK — 추가 시에만 입력)
    type: "text",
    headerName: "LBL_HELPER_CODE",
    field: "ASST_ID",
    align: "center",
    isPrimaryKey: true,
    insertable: true,
    required: true,
    validators: { required: true, max: 60, regexTp: "GCODE" },
  },
  {
    // 헬퍼 명
    type: "text",
    headerName: "LBL_HELPER_NAME",
    field: "ASST_NM",
    editable: true,
    insertable: true,
    required: true,
    validators: { required: true, max: 200 },
  },
  {
    // 헬퍼 유형
    type: "combo",
    headerName: "LBL_ASST_TCD",
    field: "ASST_TCD",
    codeKey: "asstTcd",
    editable: true,
    insertable: true,
    required: true,
    validators: { required: true },
  },
];

// 소속: 물류운영그룹 (서버 AssistSub01)
export const SUB01_COLUMN_DEFS = [
  { headerName: "No" },
  {
    // 물류운영그룹 코드 (추가 시에만 돋보기)
    type: "popup",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
    nameField: "LGST_GRP_NM",
    sqlId: "selectLogisticsgroupCodeNameNoAuth",
    popupTitle: "LBL_LOGISTICS_GROUP_CODE",
    align: "center",
    insertable: true,
    required: true,
  },
  {
    // 물류운영그룹 명
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP",
    field: "LGST_GRP_NM",
  },
  {
    // 기본값 여부
    type: "check",
    headerName: "LBL_DFT_VAL_NM",
    field: "DFT_YN",
    align: "center",
    editable: true,
    insertable: true,
  },
];
