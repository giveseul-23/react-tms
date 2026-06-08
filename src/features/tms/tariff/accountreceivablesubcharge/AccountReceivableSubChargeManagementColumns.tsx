// ────────────────────────────────────────────────────────────────
// [가이드] 그리드 컬럼 정의 템플릿
//
// 사용 방법
// 1. 이 파일을 대상 폴더로 복사 후 파일명 교체 (예: FeatureColumns.tsx)
// 2. 각 컬럼 headerName(LBL_*) / field / cellRenderer 를 실제 스펙에 맞게 교체
// 3. 필요한 audit 컬럼만 standardAudit 설정값으로 켜고 끌 것
//
// 공통 패턴
// - headerName 은 LBL_* 다국어 키 사용 (Lang.get 자동 적용)
// - field 에 "DTTM" 포함 시 DataGrid 가 자동 날짜 포맷팅
// - field 가 "_STS" 로 끝나면 자동 중앙 정렬
// - type: "numeric" / dataType: "number" → 우측 정렬
// - "No" headerName 은 자동 일련번호 + 고정 너비
// - standardAudit: 삭제/상태/생성자/생성일/수정자/수정일 블록 일괄 삽입
// ────────────────────────────────────────────────────────────────

import { numberValueFormatter } from "@/app/components/grid/columns/commonFormatters";

// ── 메인 그리드 컬럼 (정적) ────────────────────────────────────
export const MAIN_COLUMN_DEFS = [
  {
    type: "text",
    headerName: "LBL_CUSTOMER_CODE",
    field: "CUST_CD",
    isPrimaryKey: true,
  },
  {
    type: "text",
    headerName: "LBL_CUSTOMER_NAME",
    field: "CUST_NM",
  },
  {
    type: "text",
    headerName: "LBL_ACCOUNTS_RECEIVABLE_TARIFF_LEVEL_CODE",
    field: "AR_TRF_LCD",
    isPrimaryKey: true,
  },
  {
    type: "text",
    headerName: "LBL_CUSTOMER_CONTRACT_CODE",
    field: "CUST_CTRT_CD",
    isPrimaryKey: true,
  },
  {
    type: "text",
    headerName: "LBL_CUSTOMER_CONTRACT_NAME",
    field: "CUST_CTRT_NM",
  },
  {
    type: "text",
    headerName: "LBL_ACCOUNTS_RECEIVABLE_TARIFF_CODE",
    field: "AR_TRF_CD",
    isPrimaryKey: true,
  },
  {
    type: "text",
    headerName: "LBL_ACCOUNTS_RECEIVABLE_TARIFF_NAME",
    field: "AR_TRF_NM",
  },
  {
    type: "number",
    headerName: "LBL_AR_ITEM_CALC_SEQ",
    field: "CALC_RNK",
    isPrimaryKey: true,
  },
  {
    type: "text",
    headerName: "LBL_RATE_ITEM_CODE",
    field: "AR_CHG_CD",
    isPrimaryKey: true,
  },
  {
    type: "text",
    headerName: "LBL_RATE_ITEM_NAME",
    field: "AR_CHG_NM",
  },
  {
    type: "popup",
    headerName: "LBL_SUB_CHARGE_CODE",
    field: "AR_SUBCHG_CD",
    sqlId: "selectArSubChgCodeName",
    editable: true,
    insertable: true,
    required: true,
  },
  {
    type: "number",
    headerName: "LBL_MIN_COST",
    field: "MIN_COST",
    editable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    type: "number",
    headerName: "LBL_MAX_COST",
    field: "MAX_COST",
    editable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    type: "number",
    headerName: "LBL_BASIC_COST",
    field: "BSE_COST",
    editable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    type: "combo",
    headerName: "LBL_RDNG_RCD",
    field: "RDNG_RCD",
    editable: true,
    codeKey: "rdngRcd",
  },
  {
    type: "check",
    headerName: "LBL_ACCM_SUM",
    field: "ACCM_SUM_YN",
    editable: true,
  },
  {
    type: "check",
    headerName: "LBL_USE_YN",
    field: "USE_YN",
    editable: true,
  },
];

// ── 상세 그리드 컬럼 (codeMap 주입 — 코드→라벨 치환용) ─────────
export const DETAIL01_COLUMN_DEFS = [
  { type: "text", headerName: "LBL_CALC_FORMULA_SEQ", field: "SEQ" },
  {
    type: "text",
    headerName: "LBL_COST_CD",
    field: "COST_CD",
    insertable: true,
    editable: false,
    validators: {
      required: true,
      max: 60,
    },
  },
  {
    type: "text",
    headerName: "LBL_COST_NM",
    field: "COST_NM",
    insertable: true,
    editable: false,
    validators: {
      required: true,
      max: 200,
    },
  },
  {
    type: "popup",
    headerName: "LBL_CLASS_CODE",
    field: "CLSS_CD",
    sqlId: "selectClssCodeNameCostAR",
    editable: true,
    insertable: true,
    validators: {
      required: true,
      max: 60,
    },
    callback: ({ picked, commit }) =>
      commit({
        CLSS_CD: picked.CODE,
        CLSS_NM: picked.NAME,
      }),
  },
  {
    type: "",
    headerName: "LBL_CLASS_NAME",
    field: "CLSS_NM",
    readonly: true,
  },
  {
    type: "combo",
    headerName: "LBL_COST_OPTION",
    field: "OPR",
    editable: true,
    insertable: true,
    codeKey: "costOprList",
  },
  {
    type: "number",
    headerName: "LBL_COST_UNIT",
    field: "ADJ_RT",
    editable: true,
    insertable: true,
    required: true,
  },
  {
    type: "number",
    headerName: "LBL_COST",
    field: "COST_AMT",
    editable: true,
    insertable: true,
    required: true,
  },
];

export const DETAIL02_COLUMN_DEFS = [
  {
    type: "number",
    headerName: "LBL_SEQ",
    field: "COND_SEQ",
    validators: {
      required: true,
      max: 9999999999,
      min: 0,
    },
  },
  {
    type: "popup",
    headerName: "LBL_CLASS_CODE",
    field: "CLSS_CD",
    sqlId: "selectClssCodeNameCostAR",
    callback: ({ picked, commit }) =>
      commit({
        CLSS_CD: picked.CODE,
        CLSS_NM: picked.NAME,
      }),
  },
  {
    type: "text",
    headerName: "LBL_CLASS_NAME",
    field: "CLSS_NM",
    readonly: true,
  },
  {
    type: "combo",
    headerName: "LBL_CAL_OPTION",
    field: "OPR",
    codeKey: "costCondOprList",
    validators: {
      required: true,
      max: 10,
    },
    editable: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_OPT_VAL_FROM",
    field: "FRM_VAL",
    validators: {
      required: true,
      max: 2000,
    },
    editable: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_OPT_VAL_TO",
    field: "TO_VAL",
    validators: {
      max: 2000,
    },
    editable: true,
    insertable: true,
  },
  {
    type: "combo",
    headerName: "LBL_AND_OR",
    field: "LGC_OPR",
    codeKey: "lgcOprList",
    required: true,
    editable: true,
    insertable: true,
  },
];

// ────────────────────────────────────────────────────────────────
// [참고] standardAudit 의 선택적 옵션
//
// 기본 audit 컬럼을 부분적으로만 쓰고 싶을 때 두 번째 인자로 false 지정
//   standardAudit(setRowData, { updatePerson: false, updateTime: false });
//
// 삭제 체크 시 행을 실제로 제거하고 싶을 때
//   standardAudit(setRowData); // 첫 인자가 자동으로 deleteSetRowData 역할
//
// audit 컬럼의 width / fieldType 등을 개별 오버라이드
//   standardAudit(setRowData, {
//     rowStatusOverrides: { width: 100 },
//     insertPersonOverrides: { width: 110, fieldType: "text" },
//     insertDateOverrides: { width: 150 },
//   });
// ────────────────────────────────────────────────────────────────
