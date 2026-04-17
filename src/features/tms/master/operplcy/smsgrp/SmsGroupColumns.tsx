import { makeAuditColumns } from "@/app/components/grid/commonColumns";

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
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];
