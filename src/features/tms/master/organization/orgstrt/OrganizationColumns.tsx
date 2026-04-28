import { standardAudit } from "@/app/components/grid/commonColumns";

// 디비전
export const DIVISION_COLUMN_DEFS = (setGridData?: (updater: any) => void) => [
  { headerName: "No" },
  { headerName: "LBL_DIVISION_CODE", field: "DIV_CD" },
  { headerName: "LBL_DIVISION_NAME", field: "DIV_NM" },
  { headerName: "LBL_CUSTOMER_NAME", field: "CUST_CD", codeKey: "custList" },
  { headerName: "LBL_REPRESENTITIVE_ADDR", field: "DTL_ADDR1" },
  { headerName: "LBL_ZIP_CODE", field: "ZIP_CD" },
  { headerName: "LBL_CITY_NAME", field: "CTY_NM" },
  { headerName: "LBL_COUNTRY_NAME", field: "CTRY_NM" },
  { headerName: "LBL_REPRESENTATIVE_TEL_NO", field: "REP_TEL_NO" },
  { headerName: "LBL_REPRESENTITIVE", field: "REP_NM" },
  { headerName: "LBL_EXTERNAL_CODE1", field: "REF1" },
  { headerName: "LBL_EXTERNAL_CODE2", field: "REF2" },
  ...standardAudit(setGridData),
];

// 물류운영그룹
export const LOGISTICS_GROUP_COLUMN_DEFS = (
  setGridData?: (updater: any) => void,
) => [
  { headerName: "No" },
  { headerName: "LBL_LOGISTICS_GROUP_CODE", field: "LGST_GRP_CD" },
  { headerName: "LBL_LOGISTICS_GROUP_NAME", field: "LGST_GRP_NM" },
  { headerName: "LBL_REPRESENTITIVE_ADDR", field: "DTL_ADDR1" },
  { headerName: "LBL_ZIP_CODE", field: "ZIP_CD" },
  { headerName: "LBL_CITY_NAME", field: "CTY_NM" },
  { headerName: "LBL_COUNTRY_NAME", field: "CTRY_NM" },
  { headerName: "LBL_REPRESENTATIVE_TEL_NO", field: "REP_TEL_NO" },
  { headerName: "LBL_REPRESENTITIVE", field: "REP_NM" },
  { headerName: "LBL_EXTERNAL_CODE1", field: "REF1" },
  { headerName: "LBL_EXTERNAL_CODE2", field: "REF2" },
  ...standardAudit(setGridData),
];
