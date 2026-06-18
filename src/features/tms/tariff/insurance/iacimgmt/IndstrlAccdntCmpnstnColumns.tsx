import { Lang } from "@/app/services/common/Lang";

// ── 메인 그리드 컬럼 (정적) ────────────────────────────────────
export const MAIN_COLUMN_DEFS = [
  { headerName: "No" }, // 자동 일련번호
  { type: "text", field: "DIV_CD", hide: true },
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
];

// ── 상세 그리드 컬럼 ─────────────────────────────────────────
// 공통코드 → 라벨 치환은 컬럼에 codeKey 만 지정하고,
// DataGrid 에 codeMap prop 을 전달하면 자동으로 cellRenderer 가 주입됩니다.
export const DETAIL01_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", field: "LGST_GRP_CD", hide: true },
  {
    type: "combo",
    headerName: "LBL_TARIFF_TYPE",
    field: "AP_PROC_TP",
    codeKey: "apProcTp",
    required: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_IACI_ID",
    field: "INSRNC_ID",
  },
  {
    type: "popup",
    headerName: "LBL_IACI_CD",
    field: "CHG_CD",
    nameField: "CHG_NM",
    sqlId: "selectIaciApProcTpChgCodeName",
    popupTitle: "LBL_IACI_CD",
    required: true,
    insertable: true,
    extraParams: (row: any, model: any) => ({
      sqlParam1:
        (model?.grids?.rate?.rows?.find((r: any) => r.__rid__ === row?.__rid__) ?? row)
          ?.AP_PROC_TP ?? "",
    }),
  },
  {
    type: "text",
    headerName: "LBL_IACI_NM",
    field: "CHG_NM",
  },
  {
    type: "date",
    headerName: "LBL_FROM_DTTM",
    field: "FRM_DTTM",
    required: true,
    insertable: true,
  },
  {
    type: "date",
    headerName: "LBL_TO_DTTM",
    field: "TO_DTTM",
    required: true,
    insertable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_DEDUCTION",
    field: "DEDUCTION_RATE",
    required: true,
    insertable: true,
    validators: { min: 0, max: 1 },
  },
  {
    type: "numeric",
    headerName: "LBL_INSURANCE_RATE",
    field: "INSURANCE_RATE",
    required: true,
    insertable: true,
    validators: { min: 0.0001, max: 1 },
  },
  {
    type: "combo",
    headerName: Lang.get("LBL_RDNG_RCD") + "1",
    noLang: true,
    field: "RDNG_RCD1",
    codeKey: "rdngRcd",
    required: true,
    insertable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_BUD_RATE",
    field: "BUD_RATE",
    required: true,
    insertable: true,
    validators: { min: 0.0001, max: 1 },
  },
  {
    type: "numeric",
    headerName: "LBL_SPPT_RATE",
    field: "SPPT_RATE",
    required: true,
    insertable: true,
    validators: { min: 0.0001, max: 1 },
  },
  {
    type: "numeric",
    headerName: Lang.get("LBL_ADD_RATE") + "1",
    noLang: true,
    field: "EXTRA_RATE1",
    required: true,
    insertable: true,
    validators: { min: 0.0001, max: 2 },
  },
  {
    type: "numeric",
    headerName: Lang.get("LBL_ADD_RATE") + "2",
    noLang: true,
    field: "EXTRA_RATE2",
    required: true,
    insertable: true,
    validators: { min: 0.0001, max: 2 },
  },
  {
    type: "combo",
    headerName: Lang.get("LBL_RDNG_RCD") + "2",
    noLang: true,
    field: "RDNG_RCD2",
    codeKey: "rdngRcd",
    required: true,
    insertable: true,
  },
  {
    type: "check",
    headerName: "LBL_USE_YN",
    field: "USE_YN",
    insertable: true,
    defaultValue: "Y",
  },
];

export const DETAIL02_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", field: "INSRNC_ID", hide: true },
  { type: "text", field: "AP_PROC_TP", hide: true },
  {
    type: "text",
    headerName: "LBL_OPER_TCD",
    field: "CHG_CD",
  },
  {
    type: "text",
    headerName: "LBL_OPER_TNM",
    field: "CHG_NM",
  },
];

