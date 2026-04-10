// src/views/lgstgrpOprConfigMst/LgstgrpOprConfigMstColumns.tsx

// ── 플류운영그룹운영설정 (Top-left) ────────────────────────────────
export const CONFIG_COLUMN_DEFS = (setRowData: (updater: any) => void) => [
  { headerName: "No" },
  {
    //물류운영그룹운영설정코드
    headerName: "LBL_LGST_GRP_CNFG_CD",
    field: "CNFG_CD",
    editable: true,
    fieldType: "text",
  },
  {
    //물류운영그룹운영설정명
    headerName: "LBL_LGST_GRP_CNFG_NM",
    field: "CNFG_NM",
    editable: true,
    fieldType: "text",
  },
  {
    //데이터유형
    headerName: "LBL_DATA_TP",
    field: "DATA_TP",
    width: 90,
    fieldType: "text",
  },
  {
    //데이터생성유형
    headerName: "LBL_DATA_CRE_TCD",
    field: "DATA_CRE_TCD",
    width: 100,
    fieldType: "text",
  },
  {
    headerName: "LBL_DELETE",
    field: "_delete",
    width: 60,
    filter: false,
    floatingFilter: false,
    cellRenderer: (params: any) => {
      if (!params.data._isNew) return null;
      return (
        <div className="flex items-center justify-center h-full">
          <input
            type="checkbox"
            className="ag-input-field-input ag-checkbox-input"
            onChange={(e) => {
              if (e.target.checked) {
                setRowData((prev: any) =>
                  prev.filter((row: any) => row !== params.data),
                );
              }
            }}
          />
        </div>
      );
    },
  },
  { headerName: "LBL_ROW_STATUS", field: "EDIT_STS", width: 80 },
  {
    headerName: "LBL_INSERT_PERSON_ID",
    field: "CRE_USR_ID",
    width: 100,
    fieldType: "text",
  },
];

// ── 설정상세 (Top-right) ───────────────────────────────────────────
export const CONFIG_DETAIL_COLUMN_DEFS = (
  setRowData: (updater: any) => void,
) => [
  { headerName: "No" },
  {
    //물류운영설정상세코드
    headerName: "LBL_LGST_GRP_CNFG_DTL_CD",
    field: "CNFG_DTL_CD",
    editable: true,
  },
  {
    //물류운영그룹운영설정상세명
    headerName: "LBL_LGST_GRP_CNFG_DTL_NM",
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
    //속성
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
  {
    headerName: "LBL_CMMN_CD_CNFG_VAL4",
    field: "CNFG_VAL4",
    editable: true,
    width: 80,
  },
  {
    headerName: "LBL_CMMN_CD_CNFG_VAL5",
    field: "CNFG_VAL5",
    editable: true,
    width: 80,
  },
  {
    headerName: "LBL_DELETE",
    field: "_delete",
    width: 60,
    filter: false,
    floatingFilter: false,
    cellRenderer: (params: any) => {
      if (!params.data._isNew) return null;
      return (
        <div className="flex items-center justify-center h-full">
          <input
            type="checkbox"
            className="ag-input-field-input ag-checkbox-input"
            onChange={(e) => {
              if (e.target.checked) {
                setRowData((prev: any) =>
                  prev.filter((row: any) => row !== params.data),
                );
              }
            }}
          />
        </div>
      );
    },
  },
];

// ── 설정코드다국어설정 (Bottom-left) ───────────────────────────────
export const CONFIG_I18N_COLUMN_DEFS = (setRowData: (updater: any) => void) => [
  { headerName: "No" },
  {
    headerName: "LBL_LGST_GRP_CNFG_CD",
    field: "CNFG_CD",
    width: 200,
  },
  {
    //언어유형
    headerName: "LBL_LNG_PACK",
    field: "LANG_TP",
    width: 90,
  },
  {
    headerName: "LBL_LGST_GRP_CNFG_NM",
    field: "LANG_DESC",
    editable: true,
  },
  {
    headerName: "LBL_DELETE",
    field: "_delete",
    width: 60,
    filter: false,
    floatingFilter: false,
    cellRenderer: (params: any) => {
      if (!params.data._isNew) return null;
      return (
        <div className="flex items-center justify-center h-full">
          <input
            type="checkbox"
            className="ag-input-field-input ag-checkbox-input"
            onChange={(e) => {
              if (e.target.checked) {
                setRowData((prev: any) =>
                  prev.filter((row: any) => row !== params.data),
                );
              }
            }}
          />
        </div>
      );
    },
  },
  { headerName: "LBL_ROW_STATUS", field: "EDIT_STS", width: 80 },
  { headerName: "LBL_INSERT_PERSON_ID", field: "CRE_USR_ID", width: 110 },
  { headerName: "LBL_INSERT_DATE", field: "CRE_DTTM", width: 150 },
];

// ── 설정상세코드다국어설정 (Bottom-right) ──────────────────────────
export const CONFIG_DETAIL_I18N_COLUMN_DEFS = (
  setRowData: (updater: any) => void,
) => [
  { headerName: "No" },
  {
    //디비전운영설정코드
    headerName: "LBL_DIV_CNFG_CD",
    field: "CNFG_CD",
    width: 180,
  },
  {
    headerName: "LBL_LGST_GRP_CNFG_DTL_CD",
    field: "CNFG_DTL_CD",
    width: 200,
  },
  {
    headerName: "LBL_LNG_PACK",
    field: "LANG_TP",
    width: 90,
  },
  {
    headerName: "LBL_LGST_GRP_CNFG_DTL_NM",
    field: "LANG_DESC",
    editable: true,
  },
  {
    headerName: "LBL_DELETE",
    field: "_delete",
    width: 60,
    filter: false,
    floatingFilter: false,
    cellRenderer: (params: any) => {
      if (!params.data._isNew) return null;
      return (
        <div className="flex items-center justify-center h-full">
          <input
            type="checkbox"
            className="ag-input-field-input ag-checkbox-input"
            onChange={(e) => {
              if (e.target.checked) {
                setRowData((prev: any) =>
                  prev.filter((row: any) => row !== params.data),
                );
              }
            }}
          />
        </div>
      );
    },
  },
  { headerName: "LBL_ROW_STATUS", field: "EDIT_STS", width: 80 },
  { headerName: "LBL_INSERT_PERSON_ID", field: "CRE_USR_ID", width: 110 },
];
