import { standardAudit } from "@/app/components/grid/commonColumns";

// ── 플류운영그룹운영설정 (Top-left) ────────────────────────────────
export const CONFIG_COLUMN_DEFS = (setGridData?: (updater: any) => void) => [
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
    fieldType: "text",
  },
  {
    type: "text",
    //물류운영그룹운영설정명
    headerName: "LBL_LGST_GRP_CNFG_NM",
    field: "CNFG_NM",
    editable: true,
    fieldType: "text",
  },
  {
    type: "text",
    //데이터유형
    headerName: "LBL_DATA_TP",
    field: "DATA_TP",
    width: 90,
    fieldType: "text",
  },
  {
    type: "text",
    //데이터생성유형
    headerName: "LBL_DATA_CRE_TCD",
    field: "DATA_CRE_TCD",
    width: 100,
    fieldType: "text",
  },
  ...standardAudit(setGridData),
];

// ── 설정상세 (Top-right) ───────────────────────────────────────────
export const CONFIG_DETAIL_COLUMN_DEFS = (
  setGridData?: (updater: any) => void,
) => [
  { headerName: "No" },
  {
    type: "text",
    //물류운영설정상세코드
    headerName: "LBL_LGST_GRP_CNFG_DTL_CD",
    field: "CNFG_DTL_CD",
    editable: true,
  },
  {
    type: "text",
    //물류운영그룹운영설정상세명
    headerName: "LBL_LGST_GRP_CNFG_DTL_NM",
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
    //속성
    headerName: "LBL_CMMN_CD_CNFG_VAL1",
    field: "CNFG_VAL1",
    editable: true,
  },
  {
    type: "text",
    headerName: "LBL_CMMN_CD_CNFG_VAL2",
    field: "CNFG_VAL2",
    editable: true,
  },
  {
    type: "text",
    headerName: "LBL_CMMN_CD_CNFG_VAL3",
    field: "CNFG_VAL3",
    editable: true,
  },
  {
    type: "text",
    headerName: "LBL_CMMN_CD_CNFG_VAL4",
    field: "CNFG_VAL4",
    editable: true,
  },
  {
    type: "text",
    headerName: "LBL_CMMN_CD_CNFG_VAL5",
    field: "CNFG_VAL5",
    editable: true,
  },
  ...standardAudit(setGridData),
];

// ── 설정코드다국어설정 (Bottom-left) ───────────────────────────────
export const CONFIG_I18N_COLUMN_DEFS = (
  setGridData?: (updater: any) => void,
) => [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_LGST_GRP_CNFG_CD",
    field: "CNFG_CD",
  },
  {
    type: "text",
    //언어유형
    headerName: "LBL_LNG_PACK",
    field: "LANG_TP",
  },
  {
    type: "text",
    headerName: "LBL_LGST_GRP_CNFG_NM",
    field: "LANG_DESC",
    editable: true,
  },
  ...standardAudit(setGridData),
];

// ── 설정상세코드다국어설정 (Bottom-right) ──────────────────────────
export const CONFIG_DETAIL_I18N_COLUMN_DEFS = (
  setGridData?: (updater: any) => void,
) => [
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
    type: "text",
    headerName: "LBL_LNG_PACK",
    field: "LANG_TP",
  },
  {
    type: "text",
    headerName: "LBL_LGST_GRP_CNFG_DTL_NM",
    field: "LANG_DESC",
    editable: true,
  },
  ...standardAudit(setGridData),
];
