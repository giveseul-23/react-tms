// 컬럼 끝의 standardAudit 은 DataGrid 가 audit prop(model.bind 자동) 으로 추가.

// ── 메인 (Top-left) ────────────────────────────────────────────
// 키 컬럼에 isPrimaryKey:true — DataGrid 가 rowKeys/autoSelectFirstRow 자동 활성화.
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
  },
  {
    type: "text",
    headerName: "LBL_DIV_CNFG_NM",
    field: "CNFG_NM",
  },
  {
    type: "text",
    headerName: "LBL_DATA_CRE_TCD",
    field: "DATA_CRE_TCD",
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
    isPrimaryKey: true,
  },
  {
    type: "text",
    headerName: "LBL_DIV_CNFG_DTL_NM",
    field: "CNFG_DTL_NM",
    editable: true,
  },
  {
    type: "text",
    //기본값
    headerName: "LBL_DFT_VAL_NM",
    field: "DFT_YN",
    width: 70,
    cellRenderer: (params: any) => (
      <div className="flex items-center justify-center h-full">
        <input
          type="checkbox"
          className="ag-input-field-input ag-checkbox-input"
          checked={params.value === "Y"}
          readOnly
        />
      </div>
    ),
  },
  {
    type: "text",
    headerName: "LBL_CMMN_CD_CNFG_VAL1",
    field: "CNFG_VAL1",
    editable: true,
    width: 80,
  },
  {
    type: "text",
    headerName: "LBL_CMMN_CD_CNFG_VAL2",
    field: "CNFG_VAL2",
    editable: true,
    width: 80,
  },
  {
    type: "text",
    headerName: "LBL_CMMN_CD_CNFG_VAL3",
    field: "CNFG_VAL3",
    editable: true,
    width: 80,
  },
];

// ── 설정코드다국어설정 (Bottom-left) ───────────────────────────────
export const CONFIG_I18N_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_DIV_CNFG_CD",
    field: "CNFG_CD",
  },
  {
    type: "text",
    headerName: "LBL_DIV_CNFG_DTL_CD",
    field: "CNFG_DTL_CD",
  },
  {
    type: "text",
    headerName: "LBL_LNG_PACK",
    field: "LANG_TP",
  },
  {
    type: "text",
    headerName: "LBL_DIV_CNFG_DTL_NM",
    field: "LANG_DESC",
  },
];

// ── 설정상세코드다국어설정 (Bottom-right) ──────────────────────────
export const CONFIG_DETAIL_I18N_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_DIV_CNFG_CD",
    field: "CNFG_CD",
  },
  {
    type: "text",
    headerName: "LBL_LNG_PACK",
    field: "LANG_TP",
  },
  {
    type: "text",
    headerName: "LBL_DIV_CNFG_NM",
    field: "LANG_DESC",
  },
];
