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
    headerName: "LBL_CREATION_TYPE",
    field: "DF_TRF_CRE_TCD",
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
    headerName: "LBL_VEH_TRANS_TCD",
    field: "TRANS_TCD",
  },
  {
    type: "text",
    headerName: "LBL_USE_YN",
    field: "USE_YN",
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
    headerName: "LBL_DIVISION_CODE",
    field: "DIV_CD",
  },
  {
    type: "text",
    headerName: "LBL_DIVISION_NAME",
    field: "DIV_NM",
  },

  ...standardAudit(setGridData),
];

// ── 상세 그리드 컬럼 (codeMap 주입 — 코드→라벨 치환용) ─────────
//bottom - left
export const RT_ITM_COLUMN_DEFS = (
  codeMap: Record<string, Record<string, string>>,
  setGridData?: (updater: any) => void,
) => [
  { headerName: "No" },
  { type: "text", headerName: "LBL_RATE_ITEM_CD", field: "CHG_CD" },
  {
    type: "text",
    headerName: "LBL_RATE_ITEM_NAME",
    field: "CHG_NM",
  },
  {
    type: "text",
    headerName: "LBL_ORDER_BY",
    field: "DISP_SEQ",
  },
  ...standardAudit(setGridData, { updatePerson: false, updateTime: false }),
];

export const RT_CARR_COLUMN_DEFS = (
  codeMap: Record<string, Record<string, string>>,
  setGridData?: (updater: any) => void,
) => [
  { headerName: "No" },
  { type: "text", headerName: "LBL_CARRIER_CODE", field: "CARR_CD" },
  {
    type: "text",
    headerName: "LBL_CARRIER_NAME",
    field: "CARR_NM",
  },
  {
    type: "text",
    headerName: "LBL_FROM_DTTM",
    field: "FRM_DTTM",
  },
  ...standardAudit(setGridData, { updatePerson: false, updateTime: false }),
];

export const RT_VEH_TP_COLUMN_DEFS = (
  codeMap: Record<string, Record<string, string>>,
  setGridData?: (updater: any) => void,
) => [
  { headerName: "No" },
  { type: "text", headerName: "LBL_VEHICLE_TYPE_CODE", field: "VEH_TP_CD" },
  {
    type: "text",
    headerName: "LBL_VEHICLE_TYPE_NAME",
    field: "VEH_TP_NM",
  },
  ...standardAudit(setGridData, { updatePerson: false, updateTime: false }),
];

//bottom - right
export const RT_ITM_VEH_TP_COLUMN_DEFS = (
  codeMap: Record<string, Record<string, string>>,
  setGridData?: (updater: any) => void,
) => [
  { headerName: "No" },
  { type: "text", headerName: "LBL_VEHICLE_TYPE_CODE", field: "VEH_TP_CD" },
  {
    type: "text",
    headerName: "LBL_VEHICLE_TYPE_NAME",
    field: "VEH_TP_NM",
  },
  {
    type: "text",
    headerName: "LBL_RATE",
    field: "RATE",
  },
  {
    type: "text",
    headerName: "LBL_MIN_RATE",
    field: "MIN_RATE",
  },
  {
    type: "text",
    headerName: "LBL_MAX_RATE",
    field: "MAX_RATE",
  },
  {
    type: "text",
    headerName: "LBL_PARAM1",
    field: "PARAM1_VAL",
  },
  {
    type: "text",
    headerName: "LBL_PARAM2",
    field: "PARAM2_VAL",
  },
  {
    type: "text",
    headerName: "LBL_PARAM3",
    field: "PARAM3_VAL",
  },
  {
    type: "text",
    headerName: "LBL_PARAM_DESC1",
    field: "PARAM1_DESC",
  },
  {
    type: "text",
    headerName: "LBL_PARAM_DESC2",
    field: "PARAM2_DESC",
  },
  {
    type: "text",
    headerName: "LBL_PARAM_DESC3",
    field: "PARAM3_DESC",
  },
  ...standardAudit(setGridData),
];

export const RT_ITM_VEH_COLUMN_DEFS = (
  codeMap: Record<string, Record<string, string>>,
  setGridData?: (updater: any) => void,
) => [
  { headerName: "No" },
  { type: "text", headerName: "LBL_VEHICLE_TYPE_NAME", field: "VEH_TP_NM" },
  {
    type: "text",
    headerName: "LBL_VEH_NO",
    field: "VEH_NO",
  },
  {
    type: "text",
    headerName: "LBL_DRIVER_NM",
    field: "DRVR_NM",
  },
  {
    type: "text",
    headerName: "LBL_VEHICLE_CODE",
    field: "VEH_ID",
  },
  {
    type: "text",
    headerName: "LBL_RATE",
    field: "RATE",
  },
  {
    type: "text",
    headerName: "LBL_MIN_RATE",
    field: "MIN_RATE",
  },
  {
    type: "text",
    headerName: "LBL_MAX_RATE",
    field: "MAX_RATE",
  },
  {
    type: "text",
    headerName: "LBL_PARAM1",
    field: "PARAM1_VAL",
  },
  {
    type: "text",
    headerName: "LBL_PARAM2",
    field: "PARAM2_VAL",
  },
  {
    type: "text",
    headerName: "LBL_PARAM3",
    field: "PARAM3_VAL",
  },
  {
    type: "text",
    headerName: "LBL_PARAM_DESC1",
    field: "PARAM1_DESC",
  },
  {
    type: "text",
    headerName: "LBL_PARAM_DESC2",
    field: "PARAM2_DESC",
  },
  {
    type: "text",
    headerName: "LBL_PARAM_DESC3",
    field: "PARAM3_DESC",
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
