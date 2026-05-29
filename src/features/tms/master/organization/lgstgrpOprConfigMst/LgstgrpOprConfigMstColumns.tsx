// 컬럼 끝의 standardAudit 은 DataGrid 가 audit prop(model.bind 자동) 으로 추가.
// 부분 토글이 필요한 그리드만 View 에서 `audit={{ updatePerson: false }}` 명시.

// ── 플류운영그룹운영설정 (Top-left) ────────────────────────────────
// 키 컬럼에 isPrimaryKey:true — DataGrid 가 첫행 자동선택을 자동 활성화.
export const CONFIG_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_STATUS",
    field: "SIGNAL",
    align: "center",
    width: 50,
  },
  {
    type: "text",
    //물류운영그룹운영설정코드
    headerName: "LBL_LGST_GRP_CNFG_CD",
    field: "CNFG_CD",
    editable: true,
    insertable: true,
    fieldType: "text",
    isPrimaryKey: true,
  },
  {
    type: "text",
    //물류운영그룹운영설정명
    headerName: "LBL_LGST_GRP_CNFG_NM",
    field: "CNFG_NM",
    editable: true,
    insertable: true,
    fieldType: "text",
  },
  {
    type: "combo",
    headerName: "LBL_DATA_TP",
    field: "DATA_TP",
    width: 90,
    codeKey: "dataTp",
    editable: true,
    insertable: true,
  },
  {
    type: "combo",
    headerName: "LBL_DATA_CRE_TCD",
    field: "DATA_CRE_TCD",
    width: 100,
    codeKey: "dataCreTp",
    editable: true,
    insertable: true,
  },
];

// ── 설정상세 (Top-right) ───────────────────────────────────────────
// 부모 키 CNFG_CD 는 화면 표시 X — hidden 컬럼으로 isPrimaryKey 메타만 유지.
export const CONFIG_DETAIL_COLUMN_DEFS = [
  { field: "CNFG_CD", hide: true, isPrimaryKey: true },
  { headerName: "No" },
  {
    type: "text",
    //물류운영설정상세코드
    headerName: "LBL_LGST_GRP_CNFG_DTL_CD",
    field: "CNFG_DTL_CD",
    editable: true,
    insertable: true,
    isPrimaryKey: true,
  },
  {
    type: "text",
    //물류운영그룹운영설정상세명
    headerName: "LBL_LGST_GRP_CNFG_DTL_NM",
    field: "CNFG_DTL_NM",
    editable: true,
    insertable: true,
  },
  {
    type: "check",
    //기본값
    headerName: "LBL_DFT_VAL_NM",
    field: "DFT_YN",
    editable: true,
    insertable: true,
    width: 70,
  },
  {
    type: "text",
    //속성
    headerName: "LBL_CMMN_CD_CNFG_VAL1",
    field: "CNFG_VAL1",
    editable: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_CMMN_CD_CNFG_VAL2",
    field: "CNFG_VAL2",
    editable: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_CMMN_CD_CNFG_VAL3",
    field: "CNFG_VAL3",
    editable: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_CMMN_CD_CNFG_VAL4",
    field: "CNFG_VAL4",
    editable: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_CMMN_CD_CNFG_VAL5",
    field: "CNFG_VAL5",
    editable: true,
    insertable: true,
  },
];

// ── 설정코드다국어설정 (Bottom-left) ───────────────────────────────
export const CONFIG_I18N_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_LGST_GRP_CNFG_CD",
    field: "CNFG_CD",
  },
  {
    type: "combo",
    headerName: "LBL_LNG_PACK",
    field: "LANG_TP",
    codeKey: "langTp",
    editable: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_LGST_GRP_CNFG_NM",
    field: "LANG_DESC",
    editable: true,
    insertable: true,
  },
];

// ── 설정상세코드다국어설정 (Bottom-right) ──────────────────────────
export const CONFIG_DETAIL_I18N_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    //디비전운영설정코드
    headerName: "LBL_DIV_CNFG_CD",
    field: "CNFG_CD",
  },
  {
    type: "text",
    headerName: "LBL_LGST_GRP_CNFG_DTL_CD",
    field: "CNFG_DTL_CD",
  },
  {
    type: "combo",
    headerName: "LBL_LNG_PACK",
    field: "LANG_TP",
    codeKey: "langTp",
    editable: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_LGST_GRP_CNFG_DTL_NM",
    field: "LANG_DESC",
    editable: true,
    insertable: true,
  },
];
