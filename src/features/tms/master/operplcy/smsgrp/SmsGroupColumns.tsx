export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
  },
  {
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
  },
];

export const DETAIL_COLUMN_DEFS = (
  codeMap: Record<string, Record<string, string>>,
) => [
  { headerName: "LBL_VLTN_NTFCTN_CNFG_ID", field: "VLTN_NTFCTN_CNFG_ID" },
  { headerName: "LBL_LOGISTICS_GROUP_CODE", field: "LGST_GRP_CD" },
  {
    headerName: "LBL_VLTN_NTFCTN_TCD",
    field: "VLTN_NTFCTN_TCD",
    cellRenderer: (params: any) => {
      const code = params.value;
      const label = codeMap.vltnNtfctnTcd?.[String(code)] ?? code;
      return <span className={`px-2 py-0.5 rounded-lg text-xs`}>{label}</span>;
    },
  },
  { headerName: "LBL_FROM_DTTM", field: "FRM_DTTM" },
  { headerName: "LBL_TO_DTTM", field: "TO_DTTM" },
  { headerName: "LBL_CNSCTV_VLTN_CNT", field: "CNSCTV_VLTN_CNT" },
  { headerName: "LBL_MAX_VLTN_NTFCTN_CNT", field: "MAX_VLTN_NTFCTN_CNT" },
  { headerName: "LBL_VLTN_NTFCTN_INTRVL", field: "VLTN_NTFCTN_INTRVL" },
  { headerName: "LBL_USE_Y/N", field: "USE_YN" },
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
                // setRowData((prev: any) =>
                //   prev.filter((row: any) => row !== params.data),
                // );
              }
            }}
          />
        </div>
      );
    },
  },
  { headerName: "LBL_ROW_STATUS", field: "EDIT_STS", width: 80 },
  { headerName: "LBL_INSERT_PERSON_ID", field: "CRE_USR_ID" },
  { headerName: "LBL_INSERT_DATE", field: "CRE_DTTM" },
  { headerName: "LBL_UPDATE_PERSON_ID", field: "UPD_USR_ID" },
  { headerName: "LBL_UPDATE_TIME", field: "UPD_DTTM" },
];
