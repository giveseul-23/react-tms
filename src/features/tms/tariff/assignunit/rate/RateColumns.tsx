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

import { standardAudit } from "@/app/components/grid/commonColumns";

// ── 메인 그리드 컬럼 (정적) ────────────────────────────────────
export const MAIN_COLUMN_DEFS = (setGridData?: (updater: any) => void) => [
  { headerName: "No" }, // 자동 일련번호
  {
    type: "text",
    headerName: "LBL_DIVISION_CODE",
    field: "DIV_CD",
  },
  {
    type: "text",
    headerName: "LBL_DIVISION_NAME",
    field: "DIV_NM",
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
    type: "text",
    headerName: "LBL_TARIFF_CODE",
    field: "TRF_CD",
  },
  {
    type: "text",
    headerName: "LBL_TARIFF_NAME",
    field: "TRF_NM",
  },
  {
    type: "text",
    headerName: "LBL_CHG_CAL_RNK",
    field: "CHG_CALC_RNK",
  },
  {
    type: "text",
    headerName: "LBL_RATE_ITEM_CD",
    field: "CHG_CD",
  },
  {
    type: "text",
    headerName: "LBL_RATE_ITEM_NAME",
    field: "CHG_NM",
  },
  {
    type: "text",
    headerName: "LBL_SUBCHG_CAL_RNK",
    field: "SUBCHG_CALC_RNK",
  },
  {
    type: "text",
    headerName: "LBL_SERVICE_CD",
    field: "SUBCHG_CD",
  },
  {
    type: "text",
    headerName: "LBL_SERVICE_NM",
    field: "SUBCHG_NM",
  },
  {
    type: "text",
    headerName: "LBL_MIN_COST",
    field: "MIN_COST",
  },
  {
    type: "text",
    headerName: "LBL_MAX_COST",
    field: "MAX_COST",
  },
  {
    type: "text",
    headerName: "LBL_BASIC_COST",
    field: "BSE_COST",
  },
  {
    type: "text",
    headerName: "LBL_RDNG_RCD",
    field: "RDNG_RCD",
  },
  {
    type: "text",
    headerName: "LBL_ACCM_SUM",
    field: "ACCM_SUM_YN",
  },
  {
    type: "text",
    headerName: "LBL_STOP_LEVEL_CAL_YN",
    field: "STOP_LEVEL_CAL_YN",
  },
  {
    type: "text",
    headerName: "LBL_USE_YN",
    field: "USE_YN",
  },
  ...standardAudit(setGridData),
];

// ── 상세 그리드 컬럼 (codeMap 주입 — 코드→라벨 치환용) ─────────
export const DETAIL01_COLUMN_DEFS = (
  codeMap: Record<string, Record<string, string>>,
  setGridData?: (updater: any) => void,
) => [
  { headerName: "No" },
  { type: "text", headerName: "LBL_TARIFF_CODE", field: "TRF_CD" },
  {
    type: "text",
    headerName: "LBL_RATE_ITEM_CD",
    field: "CHG_CD",
  },
  {
    type: "text",
    headerName: "LBL_SERVICE_CD",
    field: "SUBCHG_CD",
  },
  {
    type: "text",
    headerName: "LBL_ORDER",
    field: "SEQ",
  },
  {
    type: "text",
    headerName: "LBL_COST_CD",
    field: "COST_CD",
  },
  {
    type: "text",
    headerName: "LBL_COST_NM",
    field: "COST_NM",
  },
  {
    type: "text",
    headerName: "LBL_CLASS_NAME",
    field: "CLSS_NM",
  },
  {
    type: "text",
    headerName: "LBL_COST_OPTION",
    field: "OPR",
  },
  {
    type: "text",
    headerName: "LBL_COST_UNIT",
    field: "ADJ_RT",
  },
  {
    type: "text",
    headerName: "LBL_COST",
    field: "COST",
  },
  ...standardAudit(setGridData),
];

export const DETAIL02_COLUMN_DEFS = (
  codeMap: Record<string, Record<string, string>>,
  setGridData?: (updater: any) => void,
) => [
  { headerName: "No" },
  { type: "text", headerName: "LBL_ORDER", field: "SEQ" },
  {
    type: "text",
    headerName: "LBL_CLASS_CODE",
    field: "CLSS_CD",
  },
  {
    type: "text",
    headerName: "LBL_CLASS_NAME",
    field: "CLSS_NM",
  },
  {
    type: "text",
    headerName: "LBL_CAL_OPTION",
    field: "OPR",
  },
  {
    type: "text",
    headerName: "LBL_OPT_VAL_FROM",
    field: "FRM_VAL",
  },
  {
    type: "text",
    headerName: "LBL_OPT_VAL_TO",
    field: "TO_VAL",
  },
  {
    type: "text",
    headerName: "AND/OR",
    field: "LGC_OPR",
  },
  ...standardAudit(setGridData),
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
