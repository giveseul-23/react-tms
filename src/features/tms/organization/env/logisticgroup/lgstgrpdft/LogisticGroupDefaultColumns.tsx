import { makeAuditColumns } from "@/app/components/grid/commonColumns";

export const CNFG_HEADER_COLUMN_DEFS = [
  {
    headerName: "LBL_LGST_GRP_CNFG_GRP_CD",
    field: "LGST_GRP_CNFG_GRP_CD",
  },
  {
    headerName: "LBL_LGST_GRP_CNFG_GRP_NM",
    field: "LGST_GRP_CNFG_GRP_NM",
  },
];

export const CNFG_DETAIL_COLUMN_DEFS = [
  {
    headerName: "LBL_LGST_GRP_CNFG_CD",
    field: "CNFG_CD",
  },
  {
    headerName: "LBL_LGST_GRP_CNFG_NM",
    field: "CNFG_NM",
  },
];

export const DETAIL_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_LGST_GRP_CNFG_CD", field: "CNFG_CD" },
  { headerName: "LBL_LOGISTICS_GROUP_CODE", field: "LGST_GRP_CD" },
  { headerName: "LBL_LOGISTICS_GROUP_NAME", field: "LGST_GRP_NM" },
  { headerName: "LBL_SETTING_VAL", field: "CNFG_DTL_CD" },
  ...makeAuditColumns({
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];
