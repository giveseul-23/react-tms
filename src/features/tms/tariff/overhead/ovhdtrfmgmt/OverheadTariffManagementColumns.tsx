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
    headerName: "LBL_DISPATCH_RATE_CD",
    field: "TRF_CD",
  },
  {
    headerName: "LBL_TARIFF_NAME",
    field: "TRF_NM",
  },
  {
    headerName: "LBL_PAY_CARRIER_CODE",
    field: "PAY_CARR_CD",
  },
  {
    headerName: "LBL_PAY_CARRIER_NAME",
    field: "PAY_CARR_NM",
  },
  {
    headerName: "LBL_FROM_DTTM",
    field: "FRM_DTTM",
  },
  {
    headerName: "LBL_TO_DTTM",
    field: "TO_DTTM",
  },
  {
    headerName: "LBL_JOB_USE_YN",
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

// ── 상세 그리드 컬럼 ─────────────────────────────────────────
// 공통코드 → 라벨 치환은 컬럼에 codeKey 만 지정하고,
// DataGrid 에 codeMap prop 을 전달하면 자동으로 cellRenderer 가 주입됩니다.
export const DETAIL_LEFT_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_LOGISTICS_GROUP_CODE", field: "LGST_GRP_CD" },
  {
    // 공통코드 → 라벨 치환 예시 (codeKey 지정)
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
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

export const DETAIL_RIGHT_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_RATE_ITEM_CD", field: "CHG_CD" },
  {
    headerName: "LBL_RATE_ITEM_NAME",
    field: "CHG_NM",
  },
  {
    headerName: "LBL_OVRHD_CHG_TP",
    field: "OVRHD_CHG_TP",
  },
  {
    headerName: "LBL_UNIT_COST",
    field: "UNIT_RATE",
  },
  {
    headerName: "LBL_APPLIED_VAL",
    field: "APPLD_VAL",
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
