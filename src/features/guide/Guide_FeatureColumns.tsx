// ────────────────────────────────────────────────────────────────
// [가이드] 그리드 컬럼 정의 템플릿
//
// 사용 방법
// 1. 이 파일을 대상 폴더로 복사 후 파일명 교체 (예: FeatureColumns.tsx)
// 2. 각 컬럼 headerName(LBL_*) / field / cellRenderer 를 실제 스펙에 맞게 교체
// 3. 필요한 audit 컬럼만 standardAudit override 로 켜고 끌 것
//
// 공통 패턴
// - headerName 은 LBL_* 다국어 키 사용 (Lang.get 자동 적용)
// - field 에 "DTTM" 포함 시 DataGrid 가 자동 날짜 포맷팅
// - field 가 "_STS" 로 끝나면 자동 중앙 정렬
// - type: "numeric" / dataType: "number" → 우측 정렬
// - "No" headerName 은 자동 일련번호 + 고정 너비
// - standardAudit: 삭제/상태/생성자/생성일/수정자/수정일 7-필드 audit 일괄 삽입
// ────────────────────────────────────────────────────────────────

import { standardAudit } from "@/app/components/grid/commonColumns";

// ── 메인 그리드 컬럼 — standardAudit 기본 (전부 ON) ─────────────
export const MAIN_COLUMN_DEFS = (setGridData?: (updater: any) => void) => [
  { headerName: "No" }, // 자동 일련번호
  {
    type: "text",
    headerName: "LBL_XXX_CODE",
    field: "XXX_CD",
  },
  {
    type: "text",
    headerName: "LBL_XXX_NAME",
    field: "XXX_NM",
  },
  {
    type: "text",
    headerName: "LBL_USE_Y/N",
    field: "USE_YN",
  },
  // 전부 ON — delete / rowStatus / insertPerson / insertDate / updatePerson / updateTime
  ...standardAudit(setGridData),
];

// ── 상세 그리드 컬럼 — updatePerson 만 끄기 ─────────────────────
// 공통코드 → 라벨 치환은 컬럼에 codeKey 만 지정하고,
// DataGrid 에 codeMap prop 을 전달하면 자동으로 cellRenderer 가 주입됩니다.
export const DETAIL_COLUMN_DEFS = (setGridData?: (updater: any) => void) => [
  { headerName: "No" },
  { type: "text", headerName: "LBL_XXX_CODE", field: "XXX_CD" },
  {
    type: "text",
    // 공통코드 → 라벨 치환 예시 (codeKey 지정)
    headerName: "LBL_XXX_TCD",
    field: "XXX_TCD",
    codeKey: "xxxTcd",
  },
  {
    type: "text",
    // 날짜/일시 필드 — DTTM 포함 시 자동 포맷팅
    headerName: "LBL_FROM_DTTM",
    field: "FRM_DTTM",
  },
  {
    // 숫자 컬럼 — 자동 우측 정렬
    headerName: "LBL_QTY",
    field: "QTY",
    type: "numeric",
  },
  // updatePerson 만 끄기 — 나머지는 그대로 ON
  ...standardAudit(setGridData, { updatePerson: false }),
];

// ── 서브 상세 그리드 컬럼 — updatePerson + updateTime 둘 다 끄기 ─
export const SUB_DETAIL_COLUMN_DEFS = (
  setGridData?: (updater: any) => void,
) => [
  { headerName: "No" },
  { type: "text", headerName: "LBL_XXX_CODE", field: "XXX_CD" },
  { type: "text", headerName: "LBL_XXX_NAME", field: "XXX_NM" },
  // 여러 audit 필드 동시 끄기
  ...standardAudit(setGridData, { updatePerson: false, updateTime: false }),
];

// ────────────────────────────────────────────────────────────────
// [참고] standardAudit 사용 예시 — 두 번째 인자로 부분 override
//
// // 1) 전부 ON (가장 많이 쓰는 패턴)
// ...standardAudit(setGridData),
//
// // 2) 한 필드만 끄기
// ...standardAudit(setGridData, { updatePerson: false }),
//
// // 3) 여러 필드 끄기
// ...standardAudit(setGridData, { updatePerson: false, updateTime: false }),
//
// // 4) 삭제 비활성
// ...standardAudit(setGridData, { delete: false }),
//
// // 5) 컬럼 width / fieldType 같은 개별 override
// ...standardAudit(setGridData, {
//   insertPersonOverrides: { width: 110 },
//   insertDateOverrides: { width: 150 },
// }),
//
// // 6) setter 가 { rows, totalCount, page, limit } 객체 형태든 행 배열이든
// //    그대로 넘기면 됨. standardAudit 가 prev 모양을 보고 알아서 처리.
//
// // 7) 변형이 너무 많으면 raw API 그대로 사용 가능
// import { makeAuditColumns } from "@/app/components/grid/commonColumns";
// ...makeAuditColumns({
//   delete: true,
//   deleteSetRowData: setGridData,
//   rowStatus: true,
//   rowStatusOverrides: { width: 100 },
//   insertPerson: true,
// }),
// ────────────────────────────────────────────────────────────────
