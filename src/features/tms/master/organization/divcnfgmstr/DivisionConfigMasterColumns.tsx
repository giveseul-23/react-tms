// 컬럼 끝의 standardAudit 은 DataGrid 가 audit prop(model.bind 자동) 으로 추가.

// ── 메인 (Top-left) ────────────────────────────────────────────
// 키 컬럼에 isPrimaryKey:true — DataGrid 가 첫행 자동선택을 자동 활성화.
export const CONFIG_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_STATUS",
    field: "SIGNAL",
    cellStyle: { textAlign: "center" },
    width: 50,
  },
  {
    type: "text",
    headerName: "LBL_DIV_CNFG_CD",
    field: "CNFG_CD",
    fieldType: "text",
    isPrimaryKey: true,
    editable: false,
    insertable: true,
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_DIV_CNFG_NM",
    field: "CNFG_NM",
    editable: true,
    insertable: true,
    required: true,
  },
  {
    type: "combo",
    headerName: "LBL_DATA_CRE_TCD",
    field: "DATA_CRE_TCD",
    codeKey: "datCreTcd",
    editable: true,
    insertable: true,
  },
];

// ── 설정상세코드다국어설정 (Bottom-left) ──────────────────────────
export const CONFIG_I18N_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_DIV_CNFG_CD",
    field: "CNFG_CD",
    required: true,
  },
  {
    type: "combo",
    headerName: "LBL_LNG_PACK",
    field: "LANG_TP",
    codeKey: "langTp",
    insertable: true,
    editable: true,
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_DIV_CNFG_NM",
    field: "LANG_DESC",
    insertable: true,
    editable: true,
    required: true,
  },
];

// ── 상세 (Top-right) ───────────────────────────────────────────
// 부모 키 CNFG_CD 는 화면 표시 X — hidden 컬럼으로 isPrimaryKey 메타만 유지.
export const CONFIG_DETAIL_COLUMN_DEFS = [
  { field: "CNFG_CD", hide: true, isPrimaryKey: true },
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_DIV_CNFG_DTL_CD",
    field: "CNFG_DTL_CD",
    editable: true,
    insertable: true,
    isPrimaryKey: true,
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_DIV_CNFG_DTL_NM",
    field: "CNFG_DTL_NM",
    editable: true,
    insertable: true,
  },
  {
    type: "check",
    headerName: "LBL_DFT_VAL_NM",
    field: "DFT_YN",
    width: 70,
    editable: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_CMMN_CD_CNFG_VAL1",
    field: "CNFG_VAL1",
    editable: true,
    insertable: true,
    width: 80,
  },
  {
    type: "text",
    headerName: "LBL_CMMN_CD_CNFG_VAL2",
    field: "CNFG_VAL2",
    editable: true,
    insertable: true,
    width: 80,
  },
  {
    type: "text",
    headerName: "LBL_CMMN_CD_CNFG_VAL3",
    field: "CNFG_VAL3",
    editable: true,
    insertable: true,
    width: 80,
  },
];

// ── 설정코드다국어설정 (Bottom-right) ───────────────────────────────
export const CONFIG_DETAIL_I18N_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_DIV_CNFG_CD",
    field: "CNFG_CD",
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_DIV_CNFG_DTL_CD",
    field: "CNFG_DTL_CD",
    required: true,
  },
  {
    type: "combo",
    headerName: "LBL_LNG_PACK",
    field: "LANG_TP",
    codeKey: "langTp",
    editable: true,
    insertable: true,
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_DIV_CNFG_DTL_NM",
    field: "LANG_DESC",
    editable: true,
    insertable: true,
    required: true,
  },
];
