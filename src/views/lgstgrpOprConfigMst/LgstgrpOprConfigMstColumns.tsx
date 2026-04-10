// src/views/lgstgrpOprConfigMst/LgstgrpOprConfigMstColumns.tsx

// ── 플류운영그룹운영설정 (Top-left) ────────────────────────────────
export const CONFIG_COLUMN_DEFS = (setRowData: (updater: any) => void) => [
  { headerName: "No" },
  {
    headerName: "플류운영그룹운영설정코드",
    field: "LGST_GRP_OPR_CONFIG_CD",
    editable: true,
    pinned: "left",
  },
  {
    headerName: "플류운영그룹운영설정명",
    field: "LGST_GRP_OPR_CONFIG_NM",
    editable: true,
    pinned: "left",
  },
  {
    headerName: "데이터유형",
    field: "DATA_TP",
    width: 90,
  },
  {
    headerName: "데이터성유형",
    field: "DATA_PROP_TP",
    width: 100,
  },
  {
    headerName: "삭제",
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
  { headerName: "편집상태", field: "EDIT_STS", width: 80 },
  { headerName: "작성자", field: "CRE_USR_ID", width: 100 },
];

// ── 설정상세 (Top-right) ───────────────────────────────────────────
export const CONFIG_DETAIL_COLUMN_DEFS = (
  setRowData: (updater: any) => void,
) => [
  { headerName: "No" },
  {
    headerName: "플류운영그룹설정상세코드",
    field: "LGST_GRP_OPR_CONFIG_DTL_CD",
    editable: true,
  },
  {
    headerName: "플류운영그룹운영설정상세명",
    field: "LGST_GRP_OPR_CONFIG_DTL_NM",
    editable: true,
  },
  {
    headerName: "기본값",
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
  { headerName: "속성1", field: "ATTR1", editable: true, width: 80 },
  { headerName: "속성2", field: "ATTR2", editable: true, width: 80 },
  { headerName: "속성3", field: "ATTR3", editable: true, width: 80 },
  { headerName: "속성4", field: "ATTR4", editable: true, width: 80 },
  { headerName: "속성5", field: "ATTR5", editable: true, width: 80 },
  {
    headerName: "삭제",
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
export const CONFIG_I18N_COLUMN_DEFS = (
  setRowData: (updater: any) => void,
) => [
  { headerName: "No" },
  {
    headerName: "플류운영그룹운영설정코드",
    field: "LGST_GRP_OPR_CONFIG_CD",
    width: 200,
  },
  {
    headerName: "언어유형",
    field: "LANG_TP",
    width: 90,
  },
  {
    headerName: "플류운영그룹운영설정명",
    field: "LGST_GRP_OPR_CONFIG_NM",
    editable: true,
  },
  {
    headerName: "삭제",
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
  { headerName: "편집상태", field: "EDIT_STS", width: 80 },
  { headerName: "작성자/등록자", field: "CRE_USR_ID", width: 110 },
  { headerName: "등록일자", field: "CRE_DTTM", width: 150 },
];

// ── 설정상세코드다국어설정 (Bottom-right) ──────────────────────────
export const CONFIG_DETAIL_I18N_COLUMN_DEFS = (
  setRowData: (updater: any) => void,
) => [
  { headerName: "No" },
  {
    headerName: "디비전운영설정코드",
    field: "LGST_GRP_OPR_CONFIG_CD",
    width: 180,
  },
  {
    headerName: "플류운영그룹운영설정상세코드",
    field: "LGST_GRP_OPR_CONFIG_DTL_CD",
    width: 200,
  },
  {
    headerName: "언어유형",
    field: "LANG_TP",
    width: 90,
  },
  {
    headerName: "플류운영그룹운영설정상세명",
    field: "LGST_GRP_OPR_CONFIG_DTL_NM",
    editable: true,
  },
  {
    headerName: "삭제",
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
  { headerName: "편집상태", field: "EDIT_STS", width: 80 },
  { headerName: "작성자/등록자", field: "CRE_USR_ID", width: 110 },
];
