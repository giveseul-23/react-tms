// ────────────────────────────────────────────────────────────────
// [가이드] 그리드 컬럼 정의 템플릿
//
// 사용 방법
// 1. 이 파일을 대상 폴더로 복사 후 파일명 교체 (예: FeatureColumns.tsx)
// 2. 각 컬럼 headerName(LBL_*) / field / cellRenderer 를 실제 스펙에 맞게 교체
// 3. audit 컬럼(삭제/상태/생성자/생성일/수정자/수정일) 은 DataGrid 가 자동 추가.
//    부분 토글이 필요하면 View 의 DataGrid 에 audit prop 으로 명시.
//
// 공통 패턴
// - headerName 은 LBL_* 다국어 키 사용 (Lang.get 자동 적용)
// - field 에 "DTTM" 포함 시 DataGrid 가 자동 날짜 포맷팅
// - field 가 "_STS" 로 끝나면 자동 중앙 정렬
// - type: "numeric" / dataType: "number" → 우측 정렬
// - "No" headerName 은 자동 일련번호 + 고정 너비
//
// 편집 가능 여부 (EDIT_STS 기반 자동 변환)
// - insertable: true              → 추가 상태(EDIT_STS:"I") 행에서만 편집
// - editable: true                → 수정 상태(EDIT_STS:"I" 아닌 행)에서만 편집
// - insertable: true, editable: true → 항상 편집 가능
// - 둘 다 미지정/false            → 편집 불가
// → PK 컬럼은 보통 isPrimaryKey:true + insertable:true (추가 시 입력 / 수정 시 잠금)
// ────────────────────────────────────────────────────────────────

// ── 메인 그리드 컬럼 — audit 자동 (model.bind 가 audit:true spread) ─
// 키 컬럼에 isPrimaryKey:true 표시 — DataGrid 가 첫행 자동선택을 자동 활성화.
import {standardAudit} from "@/app/components/grid/columns/commonColumns.tsx";

export const MAIN_COLUMN_DEFS =  [
  { headerName: "No" }, // 자동 일련번호
  {
    type: "text",
    headerName: "LBL_REQUESTED_DELIVERY_DATE",
    field: "DLVRY_DT",
    editable: false,
    locked : true,
  },
  {
    type: "text",
    headerName: "LBL_DISPATCH_NO",
    field: "DSPCH_NO",
  },
  {
    type: "text",
    headerName: "LBL_DISPATCH_PLAN_TYPE",
    field: "DSPCH_TP",
  },
    {
    type: "text",
    headerName: "LBL_DISPATCH_OPERATIONAL_STATUS",
    field: "DSPCH_OP_STS",
  },
    {
    type: "text",
    headerName: "LBL_FINANCIAL_STATUS",
    field: "FI_STS",
  },
    {
    type: "text",
    headerName: "LBL_VEHICLE_TYPE_CODE",
    field: "VEH_TP_CD",
  },
    {
    type: "text",
    headerName: "LBL_VEHICLE_TYPE_NAME",
    field: "VEH_TP_NM",
  },
    {
    type: "text",
    headerName: "LBL_VEHICLE_CODE",
    field: "VEH_ID",
  },
    {
    type: "text",
    headerName: "LBL_VEH_NO",
    field: "VEH_NO",
  }, {
    type: "text",
    headerName: "LBL_VEHICLE_OPERATION_TYPE",
    field: "VEH_OP_TP",
  },{
    type: "text",
    headerName: "LBL_DRIVER_CODE",
    field: "DRVR_ID",
  },{
    type: "text",
    headerName: "LBL_DRIVER_NAME",
    field: "DRVR_NM",
  },{
    type: "text",
    headerName: "LBL_CARRIER_CODE",
    field: "CARR_CD",
  },{
    type: "text",
    headerName: "LBL_CARRIER_NAME",
    field: "CARR_NM",
  },{
    type: "text",
    headerName: "LBL_DEPARTURE",
    field: "FRM_LOC_NM",
  },{
    type: "text",
    headerName: "LBL_DESTINATION_EX",
    field: "TO_LOC_NM",
  },{
    type: "text",
    headerName: "LBL_FINAL_LOC_ARRIVAL_TIME",
    field: "ATA_DTTM",
  },{
    type: "text",
    headerName: "LBL_LANE",
    field: "STOP_LIST",
  },{
    type: "float",
    headerName: "LBL_VOL",
    field: "PLN_NET_VOL",
  },{
    type: "text",
    headerName: "LBL_LOADING_RATE_CBM",
    field: "PLN_NET_VOL_RT",
  },{
    type: "text",
    headerName: "LBL_LOADING_RATE_CBM",
    field: "PLN_GRS_VOL_RT",
  },{
    type: "text",
    headerName: "LBL_WGT",
    field: "PLN_NET_WGT",
  },{
    type: "text",
    headerName: "LBL_WGT_LOADING_RATE",
    field: "PLN_NET_WGT_RT",
  },{
    type: "text",
    headerName: "LBL_PLT_QTY_LOADING_RATE",
    field: "PLN_PLT_RT",
  },{
    type: "text",
    headerName: "LBL_RTNR_QTY",
    field: "PLN_RTNR_QTY",
  },{
    type: "text",
    headerName: "LBL_RTNR_QTY_LOADING_RATE",
    field: "PLN_RTNR_RT",
  },{
    type: "text",
    headerName: "LBL_PBOX_QTY",
    field: "PLN_PBOX_QTY",
  },{
    type: "text",
    headerName: "LBL_PBOX_QTY_LOADING_RATE",
    field: "PLN_PBOX_RT",
  },{
    type: "text",
    headerName: "LBL_BOX_QTY",
    field: "PLN_BOX_QTY",
  },{
    type: "text",
    headerName: "LBL_FLEX_QTY1",
    field: "PLN_FLEX_QTY1",
  },{
    type: "text",
    headerName: "LBL_LOADING_RATE_FLEX_QTY1",
    field: "PLN_FLEX_QTY1_RT",
  },{
    type: "text",
    headerName: "LBL_FLEX_QTY2",
    field: "PLN_FLEX_QTY2",
  },{
    type: "text",
    headerName: "LBL_LOADING_RATE_FLEX_QTY2",
    field: "PLN_FLEX_QTY2_RT",
  },{
    type: "text",
    headerName: "LBL_FLEX_QTY3",
    field: "PLN_FLEX_QTY3",
  },{
    type: "text",
    headerName: "LBL_LOADING_RATE_FLEX_QTY3",
    field: "PLN_FLEX_QTY3_RT",
  },{
    type: "text",
    headerName: "LBL_FLEX_QTY4",
    field: "PLN_FLEX_QTY4",
  },{
    type: "text",
    headerName: "LBL_LOADING_RATE_FLEX_QTY4",
    field: "PLN_FLEX_QTY4_RT",
  },{
    type: "text",
    headerName: "LBL_FLEX_QTY5",
    field: "PLN_FLEX_QTY5",
  },{
    type: "text",
    headerName: "LBL_LOADING_RATE_FLEX_QTY5",
    field: "PLN_FLEX_QTY5_RT",
  },
];

