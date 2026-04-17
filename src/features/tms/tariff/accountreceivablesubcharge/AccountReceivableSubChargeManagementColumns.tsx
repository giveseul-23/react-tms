// ────────────────────────────────────────────────────────────────
// [가이드] 그리드 컬럼 정의 템플릿
//
// 사용 방법
// 1. 이 파일을 대상 폴더로 복사 후 파일명 교체 (예: FeatureColumns.tsx)
// 2. 각 컬럼 headerName(LBL_*) / field / cellRenderer 를 실제 스펙에 맞게 교체
// 3. 필요한 audit 컬럼만 makeAuditColumns 설정값으로 켜고 끌 것
//
// 공통 패턴
// - headerName 은 LBL_* 다국어 키 사용 (Lang.get 자동 적용)
// - field 에 "DTTM" 포함 시 DataGrid 가 자동 날짜 포맷팅
// - field 가 "_STS" 로 끝나면 자동 중앙 정렬
// - type: "numeric" / dataType: "number" → 우측 정렬
// - "No" headerName 은 자동 일련번호 + 고정 너비
// - makeAuditColumns: 삭제/상태/생성자/생성일/수정자/수정일 블록 일괄 삽입
// ────────────────────────────────────────────────────────────────

import { makeAuditColumns } from "@/app/components/grid/commonColumns";

// ── 메인 그리드 컬럼 (정적) ────────────────────────────────────
export const MAIN_COLUMN_DEFS = [
  {
    headerName: "LBL_CUSTOMER_CODE",
    field: "CUST_CD",
  },
  {
    headerName: "LBL_CUSTOMER_NAME",
    field: "CUST_NM",
  },
  {
    headerName: "LBL_ACCOUNTS_RECEIVABLE_TARIFF_LEVEL_CODE",
    field: "AR_TRF_LCD",
  },
  {
    headerName: "LBL_CUSTOMER_CONTRACT_CODE",
    field: "CUST_CTRT_CD",
  },
  {
    headerName: "LBL_CUSTOMER_CONTRACT_NAME",
    field: "CUST_CTRT_NM",
  },
  {
    headerName: "LBL_ACCOUNTS_RECEIVABLE_TARIFF_CODE",
    field: "AR_TRF_CD",
  },
  {
    headerName: "LBL_ACCOUNTS_RECEIVABLE_TARIFF_NAME",
    field: "AR_TRF_NM",
  },
  {
    headerName: "LBL_AR_ITEM_CALC_SEQ",
    field: "CALC_RNK",
  },
  {
    headerName: "LBL_RATE_ITEM_CODE",
    field: "AR_CHG_CD",
  },
  {
    headerName: "LBL_RATE_ITEM_NAME",
    field: "AR_CHG_NM",
  },
  {
    headerName: "LBL_SUB_CHARGE_CODE",
    field: "AR_SUBCHG_CD",
  },
  {
    headerName: "LBL_MIN_COST",
    field: "MIN_COST",
  },
  {
    headerName: "LBL_MAX_COST",
    field: "MAX_COST",
  },
  {
    headerName: "LBL_BASIC_COST",
    field: "BSE_COST",
  },
  {
    headerName: "LBL_RDNG_RCD",
    field: "RDNG_RCD",
  },
  {
    headerName: "LBL_ACCM_SUM",
    field: "ACCM_SUM_YN",
  },
  {
    headerName: "LBL_USE_YN",
    field: "USE_YN",
  },
  // 삭제/상태/생성/수정 컬럼을 설정값으로 일괄 추가
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: false,
    insertDate: false,
    updatePerson: false,
    updateTime: false,
  }),
];

// ── 상세 그리드 컬럼 (codeMap 주입 — 코드→라벨 치환용) ─────────
export const DETAIL01_COLUMN_DEFS = (
  codeMap: Record<string, Record<string, string>>,
) => [
  { headerName: "LBL_CALC_FORMULA_SEQ", field: "SEQ" },
  {
    headerName: "LBL_COST_CD",
    field: "COST_CD",
  },
  {
    headerName: "LBL_COST_NM",
    field: "COST_NM",
  },
  {
    headerName: "LBL_CLASS_CODE",
    field: "CLSS_CD",
  },
  {
    headerName: "LBL_CLASS_NAME",
    field: "CLSS_NM",
  },
  {
    headerName: "LBL_COST_OPTION",
    field: "OPR",
  },
  {
    headerName: "LBL_COST_UNIT",
    field: "ADJ_RT",
  },
  {
    headerName: "LBL_COST",
    field: "COST_AMT",
  },
  ...makeAuditColumns({
    delete: true,
    rowStatus: false,
    insertPerson: false,
    insertDate: false,
    updatePerson: false,
    updateTime: false,
  }),
];

export const DETAIL02_COLUMN_DEFS = (
  codeMap: Record<string, Record<string, string>>,
) => [
  { headerName: "LBL_SEQ", field: "COND_SEQ" },
  {
    headerName: "LBL_CLASS_CODE",
    field: "CLSS_CD",
  },
  {
    headerName: "LBL_CLASS_NAME",
    field: "CLSS_NM",
  },
  {
    headerName: "LBL_CAL_OPTION",
    field: "OPR",
  },
  {
    headerName: "LBL_OPT_VAL_FROM",
    field: "FRM_VAL",
  },
  {
    headerName: "LBL_OPT_VAL_TO",
    field: "TO_VAL",
  },
  {
    headerName: "LBL_AND_OR",
    field: "LGC_OPR",
  },
  ...makeAuditColumns({
    delete: true,
    rowStatus: false,
    insertPerson: false,
    insertDate: false,
    updatePerson: false,
    updateTime: false,
  }),
];

// ────────────────────────────────────────────────────────────────
// [참고] makeAuditColumns 의 선택적 옵션
//
// 기본 audit 컬럼을 부분적으로만 쓰고 싶을 때 플래그를 false / 생략
//   makeAuditColumns({
//     rowStatus: true,
//     insertPerson: true,
//     // delete, insertDate, updatePerson, updateTime 는 생략됨
//   });
//
// 삭제 체크 시 행을 실제로 제거하고 싶을 때
//   makeAuditColumns({
//     delete: true,
//     deleteSetRowData: setRowData, // (prev) => prev.filter(...) 호출
//   });
//
// audit 컬럼의 width / fieldType 등을 개별 오버라이드
//   makeAuditColumns({
//     rowStatus: true,
//     rowStatusOverrides: { width: 100 },
//     insertPerson: true,
//     insertPersonOverrides: { width: 110, fieldType: "text" },
//     insertDate: true,
//     insertDateOverrides: { width: 150 },
//   });
// ────────────────────────────────────────────────────────────────
