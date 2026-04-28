import { standardAudit } from "@/app/components/grid/commonColumns";

export const CNFG_HEADER_COLUMN_DEFS = (
  setGridData?: (updater: any) => void,
) => [
  {
    type: "text",
    headerName: "LBL_LGST_GRP_CNFG_GRP_CD",
    field: "LGST_GRP_CNFG_GRP_CD",
  },
  {
    type: "text",
    headerName: "LBL_LGST_GRP_CNFG_GRP_NM",
    field: "LGST_GRP_CNFG_GRP_NM",
  },
];

export const CNFG_DETAIL_COLUMN_DEFS = (
  setGridData?: (updater: any) => void,
) => [
  {
    type: "text",
    headerName: "LBL_LGST_GRP_CNFG_CD",
    field: "CNFG_CD",
  },
  {
    type: "text",
    headerName: "LBL_LGST_GRP_CNFG_NM",
    field: "CNFG_NM",
  },
];

export const DETAIL_COLUMN_DEFS = (setGridData?: (updater: any) => void) => [
  { headerName: "No" },
  { type: "text", headerName: "LBL_LGST_GRP_CNFG_CD", field: "CNFG_CD" },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
  },
  { type: "text", headerName: "LBL_SETTING_VAL", field: "CNFG_DTL_CD" },
  ...standardAudit(setGridData),
];
