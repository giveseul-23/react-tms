// 컬럼 끝의 standardAudit 은 DataGrid 가 audit prop(model.bind 자동) 으로 추가.
// CNFG_HEADER / CNFG_DETAIL 는 audit 없는 컬럼 — View 에서 audit={false} 명시.

// 키 컬럼에 isPrimaryKey:true — DataGrid 가 첫행 자동선택을 자동 활성화.
export const CNFG_HEADER_COLUMN_DEFS = [
  {
    type: "text",
    field: "LGST_GRP_CNFG_GRP_CD",
    isPrimaryKey: true,
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_LGST_GRP_CNFG_GRP_CD",
    field: "LGST_GRP_CNFG_GRP_NM",
  },
];

export const CNFG_DETAIL_COLUMN_DEFS = [
  {
    type: "text",
    headerName: "LBL_LGST_GRP_CNFG_NM",
    field: "CNFG_NM",
    isPrimaryKey: true,
  },
];

// DETAIL 만 audit 컬럼 사용 — DataGrid 자동 추가 (model.bind 의 audit:true).
export const DETAIL_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_LGST_GRP_CNFG_CD",
    field: "CNFG_CD",
    hide: true,
  },
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
  {
    type: "combo",
    headerName: "LBL_SETTING_VAL",
    field: "CNFG_DTL_CD",
    codeKey: "cnfgDtlTcd",
    editable: true,
    insertable: true,
  },
];
