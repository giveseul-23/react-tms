import { makeAuditColumns } from "@/app/components/grid/commonColumns";

export const MAIN_COLUMN_DEFS = [
  {
    headerName: "LBL_SMS_GRP_CD",
    field: "SMS_GRP_CD",
  },
  {
    headerName: "LBL_SMS_GRP_DESC",
    field: "SMS_GRP_DESC",
  },
  {
    headerName: "LBL_USE_Y/N",
    field: "USE_YN",
  },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

export const DETAIL_COLUMN_DEFS = (
  codeMap: Record<string, Record<string, string>>,
) => [
  { headerName: "No" },
  { headerName: "LBL_SMS_GRP_CD", field: "SMS_GRP_CD" },
  { headerName: "LBL_LOGISTICS_GROUP_CODE", field: "LGST_GRP_CD" },
  {
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
    cellRenderer: (params: any) => {
      const code = params.value;
      const label = codeMap.vltnNtfctnTcd?.[String(code)] ?? code;
      return <span className={`px-2 py-0.5 rounded-lg text-xs`}>{label}</span>;
    },
  },
  { headerName: "LBL_RECEIVER_ID", field: "USR_ID" },
  { headerName: "LBL_RECEIVER_NM", field: "USR_NM" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];
