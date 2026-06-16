// 요율관리 그리드 컬럼 — audit 컬럼은 DataGrid 가 자동 추가(model.bind).
// 서버 TariffMain / TariffSub01 / TariffSub02 컬럼 대응. audit/del/editstatus 컬럼은 OMIT.

// ── 메인(요율) ────────────────────────────────────────────────────
export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    // DIV
    type: "popup",
    headerName: "LBL_DIVISION_CODE",
    field: "DIV_CD",
    nameField: "DIV_NM",
    sqlId: "selectDivisionCodeName",
    popupTitle: "LBL_DIVISION_CODE",
    align: "center",
    width: 80,
    insertable: true,
    required: true,
    validators: { required: true, max: 60 },
    callback: ({ commit }: any) => {
      commit({ LGST_GRP_CD: "", LGST_GRP_NM: "" });
    },
  },
  {
    // DIV명
    type: "text",
    headerName: "LBL_DIVISION_NAME",
    field: "DIV_NM",
    width: 80,
    validators: { max: 200 },
  },
  {
    // 물류운영그룹
    type: "popup",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
    nameField: "LGST_GRP_NM",
    sqlId: "selectLogisticsgroupCodeName",
    popupTitle: "LBL_LOGISTICS_GROUP_CODE",
    align: "center",
    width: 90,
    insertable: true,
    required: true,
    validators: { required: true, max: 60 },
    extraParams: (row: any) => ({ keyParam: row?.DIV_CD ?? "" }),
  },
  {
    // 물류운영그룹명
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
    width: 90,
    validators: { max: 200 },
  },
  {
    // 요율코드
    type: "text",
    headerName: "LBL_TARIFF_CODE",
    field: "TRF_CD",
    width: 200,
    insertable: true,
    required: true,
    validators: { required: true, max: 60, regexTp: "GCODE" },
  },
  {
    // 요율명
    type: "text",
    headerName: "LBL_TARIFF_NAME",
    field: "TRF_NM",
    width: 270,
    insertable: true,
    editable: true,
    required: true,
    validators: { required: true, max: 200 },
  },
  {
    // 협력사
    type: "popup",
    headerName: "LBL_CARRIER_CODE",
    field: "CARR_CD",
    nameField: "CARR_NM",
    sqlId: "selectCarrListWithLgst",
    popupTitle: "LBL_CARRIER_CODE",
    align: "center",
    width: 100,
    insertable: true,
    required: true,
    validators: { required: true, max: 60 },
    extraParams: (row: any) => ({ keyParam: row?.LGST_GRP_CD ?? "" }),
  },
  {
    // 협력사명
    type: "text",
    headerName: "LBL_CARRIER_NAME",
    field: "CARR_NM",
    width: 100,
    validators: { max: 200 },
  },
  {
    // 적용시작유가
    type: "numeric",
    headerName: "LBL_FROM_APPLD_OIL_PRICE",
    field: "FRM_APPLD_OIL_PRICE",
    align: "right",
    width: 100,
    insertable: true,
    editable: true,
    validators: { min: 0 },
  },
  {
    // 적용종료유가
    type: "numeric",
    headerName: "LBL_TO_APPLD_OIL_PRICE",
    field: "TO_APPLD_OIL_PRICE",
    align: "right",
    width: 100,
    insertable: true,
    editable: true,
    validators: { min: 0 },
  },
  {
    // 적용시작일자
    type: "date",
    headerName: "LBL_FROM_DATE",
    field: "STT_DT",
    align: "center",
    width: 110,
    insertable: true,
    editable: true,
    required: true,
    validators: { required: true },
  },
  {
    // 적용종료일자
    type: "date",
    headerName: "LBL_TO_DATE",
    field: "END_DT",
    align: "center",
    width: 110,
    insertable: true,
    editable: true,
    required: true,
    defaultValue: "20501231",
    validators: { required: true },
  },
  {
    // 사용여부
    type: "check",
    headerName: "LBL_USE_YN",
    field: "USE_YN",
    align: "center",
    width: 60,
    insertable: true,
    editable: true,
  },
  {
    // 화폐코드
    type: "popup",
    headerName: "LBL_CURRENCY_CODE",
    field: "CURR_CD",
    nameField: "CURR_NM",
    sqlId: "selectCurrencyCodeName",
    popupTitle: "LBL_CURRENCY_CODE",
    align: "center",
    width: 70,
    insertable: true,
    required: true,
    validators: { required: true, max: 60 },
  },
  {
    // 화폐명
    type: "text",
    headerName: "LBL_CURRENCY_NAME",
    field: "CURR_NM",
    width: 100,
    validators: { max: 200 },
  },
  {
    // 서비스유형구분
    type: "combo",
    headerName: "LBL_SVC_TYPE_DIV",
    field: "SRVC_TP",
    codeKey: "serviceTypeList",
    align: "center",
    width: 100,
    insertable: true,
    editable: true,
    required: true,
    validators: { required: true, max: 20 },
  },
  {
    // 요율변경만허용
    type: "check",
    headerName: "LBL_RATE_SHOP_ONLY",
    field: "RATE_SHOP_ONLY",
    align: "center",
    width: 100,
    insertable: true,
    editable: true,
  },
];

// ── 요율항목(sub01) ───────────────────────────────────────────────
export const SUB01_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_TARIFF_CODE",
    field: "TRF_CD",
    width: 150,
    hide: true,
  },
  {
    // 계산순서
    type: "numeric",
    headerName: "LBL_CAL_RNK",
    field: "CALC_RNK",
    align: "right",
    flex: 1,
    insertable: true,
    editable: true,
    required: true,
    validators: { required: true },
  },
  {
    // 요율항목코드
    type: "popup",
    headerName: "LBL_RATE_ITEM_CD",
    field: "CHG_CD",
    nameField: "CHG_NM",
    sqlId: "selectTariffChgCodeNameH2",
    popupTitle: "LBL_RATE_ITEM_CD",
    flex: 1,
    insertable: true,
    required: true,
    validators: { required: true, max: 60 },
    extraParams: (row: any) => ({ keyParam: row?.TRF_CD ?? "" }),
  },
  {
    // 요율항목명
    type: "text",
    headerName: "LBL_RATE_ITEM_NAME",
    field: "CHG_NM",
    flex: 1,
    validators: { max: 200 },
  },
  {
    type: "text",
    headerName: "FNT_OPR",
    field: "FNT_OPR",
    width: 80,
    hide: true,
  },
];

// ── 차량유형(sub02) ───────────────────────────────────────────────
export const SUB02_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_TARIFF_CODE",
    field: "TRF_CD",
    width: 160,
    hide: true,
  },
  {
    // 차량유형코드
    type: "popup",
    headerName: "LBL_VEHICLE_TYPE_CODE",
    field: "VEH_TP_CD",
    nameField: "VEH_TP_NM",
    sqlId: "selectVehTpList",
    popupTitle: "LBL_VEHICLE_TYPE_CODE",
    flex: 1,
    insertable: true,
    required: true,
    validators: { required: true, max: 60 },
  },
  {
    // 차량유형명
    type: "text",
    headerName: "LBL_VEHICLE_TYPE_NAME",
    field: "VEH_TP_NM",
    flex: 1,
    validators: { max: 200 },
  },
];
