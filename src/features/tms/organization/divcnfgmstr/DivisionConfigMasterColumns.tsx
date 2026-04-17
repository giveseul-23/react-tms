import { makeAuditColumns } from "@/app/components/grid/commonColumns";

// ── (Top-left) ────────────────────────────────
export const CONFIG_COLUMN_DEFS = (setRowData: (updater: any) => void) => [
  { headerName: "No" },
  {
    headerName: "LBL_STATUS",
    field: "SIGNAL",
    cellStyle: { textAlign: "center" },
    width: 50,
  },
  {
    headerName: "LBL_DIV_CNFG_CD",
    field: "CNFG_CD",
    fieldType: "text",
  },
  {
    headerName: "LBL_DIV_CNFG_NM",
    field: "CNFG_NM",
  },
  {
    headerName: "LBL_DATA_CRE_TCD",
    field: "DATA_CRE_TCD",
  },
  ...makeAuditColumns({
    delete: true,
    deleteSetRowData: setRowData,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// ──  (Top-right) ───────────────────────────────────────────
export const CONFIG_DETAIL_COLUMN_DEFS = (
  setRowData: (updater: any) => void,
) => [
  { headerName: "No" },
  {
    headerName: "LBL_DIV_CNFG_DTL_CD",
    field: "CNFG_DTL_CD",
    editable: true,
  },
  {
    headerName: "LBL_DIV_CNFG_DTL_NM",
    field: "CNFG_DTL_NM",
    editable: true,
  },
  {
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
    headerName: "LBL_CMMN_CD_CNFG_VAL1",
    field: "CNFG_VAL1",
    editable: true,
    width: 80,
  },
  {
    headerName: "LBL_CMMN_CD_CNFG_VAL2",
    field: "CNFG_VAL2",
    editable: true,
    width: 80,
  },
  {
    headerName: "LBL_CMMN_CD_CNFG_VAL3",
    field: "CNFG_VAL3",
    editable: true,
    width: 80,
  },
  ...makeAuditColumns({
    delete: true,
    deleteSetRowData: setRowData,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// ── 설정코드다국어설정 (Bottom-left) ───────────────────────────────
export const CONFIG_I18N_COLUMN_DEFS = (setRowData: (updater: any) => void) => [
  { headerName: "No" },
  {
    headerName: "LBL_DIV_CNFG_CD",
    field: "CNFG_CD",
  },
  {
    headerName: "LBL_DIV_CNFG_DTL_CD",
    field: "CNFG_DTL_CD",
  },
  {
    headerName: "LBL_LNG_PACK",
    field: "LANG_TP",
  },
  {
    headerName: "LBL_DIV_CNFG_DTL_NM",
    field: "LANG_DESC",
  },
  ...makeAuditColumns({
    delete: true,
    deleteSetRowData: setRowData,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// ── 설정상세코드다국어설정 (Bottom-right) ──────────────────────────
export const CONFIG_DETAIL_I18N_COLUMN_DEFS = (
  setRowData: (updater: any) => void,
) => [
  { headerName: "No" },
  {
    headerName: "LBL_DIV_CNFG_CD",
    field: "CNFG_CD",
  },
  {
    headerName: "LBL_LNG_PACK",
    field: "LANG_TP",
  },
  {
    headerName: "LBL_DIV_CNFG_NM",
    field: "LANG_DESC",
  },
  ...makeAuditColumns({
    delete: true,
    deleteSetRowData: setRowData,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];
