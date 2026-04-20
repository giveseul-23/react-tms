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
  { headerName: "No" }, // 자동 일련번호
  {
    headerName: "LBL_DIVISION_CODE",
    field: "DIV_CD",
  },
  {
    headerName: "LBL_DIVISION_NAME",
    field: "DIV_NM",
  },
  {
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
  },
  {
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
  },
  {
    headerName: "LBL_TARIFF_CODE",
    field: "TRF_CD",
  },
  {
    headerName: "LBL_TARIFF_NAME",
    field: "TRF_NM",
  },
  {
    headerName: "LBL_CHG_CAL_RNK",
    field: "CHG_CALC_RNK",
  },
  {
    headerName: "LBL_RATE_ITEM_CD",
    field: "CHG_CD",
  },
  {
    headerName: "LBL_RATE_ITEM_NAME",
    field: "CHG_NM",
  },
  {
    headerName: "LBL_SUBCHG_CAL_RNK",
    field: "SUBCHG_CALC_RNK",
  },
  {
    headerName: "LBL_SERVICE_CD",
    field: "SUBCHG_CD",
  },
  {
    headerName: "LBL_SERVICE_NM",
    field: "SUBCHG_NM",
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
    headerName: "LBL_STOP_LEVEL_CAL_YN",
    field: "STOP_LEVEL_CAL_YN",
  },
  {
    headerName: "LBL_USE_YN",
    field: "USE_YN",
  },
  // 삭제/상태/생성/수정 컬럼을 설정값으로 일괄 추가
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// ── 상세 그리드 컬럼 (codeMap 주입 — 코드→라벨 치환용) ─────────
export const DETAIL01_COLUMN_DEFS = (
  codeMap: Record<string, Record<string, string>>,
) => [
  { headerName: "No" },
  { headerName: "LBL_TARIFF_CODE", field: "TRF_CD" },
  {
    headerName: "LBL_RATE_ITEM_CD",
    field: "CHG_CD",
  },
  {
    headerName: "LBL_SERVICE_CD",
    field: "SUBCHG_CD",
  },
  {
    headerName: "LBL_ORDER",
    field: "SEQ",
  },
  {
    headerName: "LBL_COST_CD",
    field: "COST_CD",
  },
  {
    headerName: "LBL_COST_NM",
    field: "COST_NM",
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
    field: "COST",
  },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

export const DETAIL02_COLUMN_DEFS = (
  codeMap: Record<string, Record<string, string>>,
) => [
  { headerName: "No" },
  { headerName: "LBL_ORDER", field: "SEQ" },
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
    headerName: "AND/OR",
    field: "LGC_OPR",
  },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
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
