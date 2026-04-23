import { makeAuditColumns } from "@/app/components/grid/commonColumns";

// 디비전
export const DIVISION_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_DIV_CD", field: "DIV_CD" },
  { headerName: "LBL_DIV_NM", field: "DIV_NM" },
  { headerName: "LBL_CUST_NM", field: "CUST_NM" },
  { headerName: "LBL_ADDR_SEARCH", field: "ADDR_SEARCH" },
  { headerName: "LBL_REP_ADDR", field: "REP_ADDR" },
  { headerName: "LBL_ZIP_CD", field: "ZIP_CD" },
  { headerName: "LBL_CTY_NM", field: "CTY_NM" },
  { headerName: "LBL_CTRY_NM", field: "CTRY_NM" },
  { headerName: "LBL_REP_TEL", field: "REP_TEL" },
  { headerName: "LBL_REP_NM", field: "REP_NM" },
  { headerName: "LBL_EXT_CD_1", field: "EXT_CD_1" },
  { headerName: "LBL_EXT_CD_2", field: "EXT_CD_2" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// 물류운영그룹
export const LOGISTICS_GROUP_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_LGST_GRP_CD", field: "LGST_GRP_CD" },
  { headerName: "LBL_LGST_GRP_NM", field: "LGST_GRP_NM" },
  { headerName: "LBL_ADDR_SEARCH", field: "ADDR_SEARCH" },
  { headerName: "LBL_REP_ADDR", field: "REP_ADDR" },
  { headerName: "LBL_ZIP_CD", field: "ZIP_CD" },
  { headerName: "LBL_CTY_NM", field: "CTY_NM" },
  { headerName: "LBL_CTRY_NM", field: "CTRY_NM" },
  { headerName: "LBL_REP_TEL", field: "REP_TEL" },
  { headerName: "LBL_REP_NM", field: "REP_NM" },
  { headerName: "LBL_EXT_CD_1", field: "EXT_CD_1" },
  { headerName: "LBL_EXT_CD_2", field: "EXT_CD_2" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];
