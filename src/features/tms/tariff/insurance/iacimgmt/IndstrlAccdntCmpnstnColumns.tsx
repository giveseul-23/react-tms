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
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
  },
  // 삭제/상태/생성/수정 컬럼을 설정값으로 일괄 추가
  ...makeAuditColumns({
    delete: false,
    rowStatus: false,
    insertPerson: false,
    insertDate: false,
    updatePerson: false,
    updateTime: false,
  }),
];

// ── 상세 그리드 컬럼 ─────────────────────────────────────────
// 공통코드 → 라벨 치환은 컬럼에 codeKey 만 지정하고,
// DataGrid 에 codeMap prop 을 전달하면 자동으로 cellRenderer 가 주입됩니다.
export const DETAIL01_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_TARIFF_TYPE", field: "AP_PROC_TP" },
  {
    type: "text",
    headerName: "LBL_IACI_ID",
    field: "INSRNC_ID",
  },
  {
    type: "text",
    headerName: "LBL_IACI_CD",
    field: "CHG_CD",
  },
  {
    type: "text",
    headerName: "LBL_IACI_NM",
    field: "CHG_NM",
  },
  {
    type: "text",
    headerName: "LBL_FROM_DTTM",
    field: "FRM_DTTM",
  },
  {
    type: "text",
    headerName: "LBL_TO_DTTM",
    field: "TO_DTTM",
  },
  {
    type: "text",
    headerName: "LBL_DEDUCTION",
    field: "DEDUCTION_RATE",
  },
  {
    type: "text",
    headerName: "LBL_INSURANCE_RATE",
    field: "INSURANCE_RATE",
  },
  {
    type: "text",
    headerName: "LBL_RDNG_RCD1",
    field: "RDNG_RCD1",
  },
  {
    type: "text",
    headerName: "LBL_BUD_RATE",
    field: "BUD_RATE",
  },
  {
    type: "text",
    headerName: "LBL_SPPT_RATE",
    field: "SPPT_RATE",
  },
  {
    type: "text",
    headerName: "LBL_ADD_RATE1",
    field: "EXTRA_RATE1",
  },
  {
    type: "text",
    headerName: "LBL_ADD_RATE2",
    field: "EXTRA_RATE2",
  },
  {
    type: "text",
    headerName: "LBL_RDNG_RCD2",
    field: "RDNG_RCD2",
  },
  {
    type: "text",
    headerName: "LBL_USE_YN",
    field: "USE_YN",
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

export const DETAIL02_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_IACI_ID", field: "INSRNC_ID" },
  {
    type: "text",
    headerName: "LBL_TARIFF_TYPE",
    field: "AP_PROC_TP",
  },
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
