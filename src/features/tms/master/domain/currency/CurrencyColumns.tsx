import { makeAuditColumns } from "@/app/components/grid/commonColumns";

export const MAIN_COLUMN_DEFS = (
  codeMap: Record<string, Record<string, string>>,
) => [
  { headerName: "No" },
  {
    headerName: "LBL_CURRENCY_CODE",
    field: "CURR_CD",
  },
  { headerName: "LBL_CURRENCY_NAME", field: "CURR_NM" },
  { headerName: "LBL_DECIMAL_PRECISION", field: "DECIMAL_PRECISION" },
  {
    headerName: "LBL_CURR_RDNG_RCD",
    field: "CURR_RDNG_RCD",
    cellRenderer: (params: any) => {
      const code = params.value;
      const label = codeMap.currRdngRcd?.[String(code)] ?? code;
      return <span className={`px-2 py-0.5 rounded-lg text-xs`}>{label}</span>;
    },
  },
  { headerName: "LBL_DSPL_ORD", field: "DSPLY_SEQ" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];
