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
export const MAIN_COLUMN_DEFS = [
  { headerName: "No" }, // 자동 일련번호
  { type: "text", headerName: "LBL_CUSTOMER_ORDER_NO", field: "CUST_ORD_NO" },
  { type: "text", headerName: "LBL_ORDER_TYPE", field: "ORD_TP" },
  { type: "text", headerName: "LBL_SHIPMENT_OP_STATUS", field: "SHPM_OP_STS" },
  { type: "text", headerName: "LBL_CUSTOMER_CODE", field: "CUST_CD" },
  { type: "text", headerName: "LBL_CUSTOMER_NAME", field: "CUST_NM" },
  { type: "text", headerName: "LBL_DEPARTURE_CODE", field: "FRM_LOC_CD" },
  { type: "text", headerName: "LBL_DEPARTURE_NAME", field: "FRM_LOC_NM" },
  { type: "text", headerName: "LBL_DEPARTURE_ADDRESS", field: "FR_ADDR" },
  { type: "text", headerName: "LBL_DEPARTURE_COUNTRY_NAME", field: "FR_CTRY_NM" },
  { type: "text", headerName: "LBL_DESTINATION_CODE", field: "TO_LOC_CD" },
  { type: "text", headerName: "LBL_DESTINATION_NAME", field: "TO_LOC_NM" },
  { type: "text", headerName: "LBL_DESTINATION_ADDRESS", field: "TO_ADDR" },
  { type: "text", headerName: "LBL_DESTINATION_COUNTRY_NAME", field: "TO_CTRY_NM" },
  { type: "text", headerName: "LBL_ORDER_NO", field: "ORD_NO" },
  { type: "text", headerName: "LBL_SHIPMENT_NUMBER", field: "SHPM_NO" },
  { type: "text", headerName: "LBL_REQUESTED_DELIVERY_DATE", field: "DLVRY_DT" },
  { type: "text", headerName: "LBL_MIT_CODE_NAME", field: "MIT_CLSS_CD" },
  { type: "text", headerName: "LBL_DIVISION_CODE", field: "DIV_CD" },
  { type: "text", headerName: "LBL_DIVISION_NAME", field: "DIV_NM" },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_CODE", field: "LGST_GRP_CD" },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_NAME", field: "LGST_GRP_NM" },
  { type: "text", headerName: "LBL_SHIPMENT_TYPE", field: "SHPM_TP" },
  { type: "text", headerName: "LBL_PLAN_ID", field: "PLN_ID" },
  { type: "text", headerName: "LBL_PLAN_NAME", field: "PLN_NM" },
  { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO" },
  { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO" },
  { type: "text", headerName: "LBL_DRIVER_NAME", field: "DRVR_NM" },
  { type: "text", headerName: "LBL_DRIVER_TEL", field: "" },
  { type: "text", headerName: "LBL_CARRIER_CODE", field: "CARR_CD" },
  { type: "text", headerName: "LBL_CARRIER_NAME", field: "CARR_NM" },
];

// ── 상세 그리드 컬럼 ───────────────────────────────────────────────
// 공통코드 → 라벨 치환은 컬럼에 codeKey 만 지정하고,
// DataGrid 에 codeMap prop 을 전달하면 자동으로 cellRenderer 가 주입됩니다.
export const DETAIL_COLUMN_DEFS = [
  { headerName: "No" },
   { type: "text", headerName: "LBL_ITEM_CD", field: "CUST_ITEM_CD" },
  { type: "text", headerName: "LBL_ITEM_NM", field: "CUST_ITEM_NM" },
  { type: "text", headerName: "LBL_PLN_ORD_QTY_UOM", field: "PLN_ORD_QTY_UOM" },
  { type: "number", headerName: "LBL_PLN_ORD_QTY", field: "PLN_ORD_QTY" },
  { type: "text", headerName: "LBL_PLN_INV_QTY_UOM", field: "PLN_INV_QTY_UOM" },
  { type: "number", headerName: "LBL_PLN_INV_QTY", field: "PLN_INV_QTY" },
  { type: "float", headerName: "LBL_PLN_NET_VOL", field: "PLN_NET_VOL" },
  { type: "float", headerName: "LBL_PLN_GRS_VOL", field: "PLN_GRS_VOL" },
  { type: "number", headerName: "LBL_PLN_NET_WGT", field: "PLN_NET_WGT" },
  { type: "number", headerName: "LBL_PLN_GRS_WGT", field: "PLN_GRS_WGT" },
  { type: "number", headerName: "LBL_PLN_PLT_QTY", field: "PLN_PLT_QTY" },
  { type: "number", headerName: "LBL_PLN_RTNR_QTY", field: "PLN_RTNR_QTY" },
  { type: "number", headerName: "LBL_PLN_PBOX_QTY", field: "PLN_PBOX_QTY" },
  { type: "number", headerName: "LBL_PLN_BOX_QTY", field: "PLN_BOX_QTY" },
  { type: "number", headerName: "LBL_PLANNED_FLEX_QTY1", field: "PLN_FLEX_QTY1" },
  { type: "number", headerName: "LBL_PLANNED_FLEX_QTY2", field: "PLN_FLEX_QTY2" },
  { type: "number", headerName: "LBL_PLANNED_FLEX_QTY3", field: "PLN_FLEX_QTY3" },
  { type: "number", headerName: "LBL_PLANNED_FLEX_QTY4", field: "PLN_FLEX_QTY4" },
  { type: "number", headerName: "LBL_PLANNED_FLEX_QTY5", field: "PLN_FLEX_QTY5" },
  { type: "text", headerName: "LBL_CFM_ORD_QTY_UOM", field: "CFM_ORD_QTY_UOM" },
  { type: "number", headerName: "LBL_CFM_ORD_QTY", field: "CFM_ORD_QTY" },
  { type: "text", headerName: "LBL_CFM_INV_QTY_UOM", field: "CFM_INV_QTY_UOM" },
  { type: "number", headerName: "LBL_CFM_INV_QTY", field: "CFM_INV_QTY" },
  { type: "float", headerName: "LBL_CFM_NET_VOL", field: "CFM_NET_VOL" },
  { type: "float", headerName: "LBL_CFM_GRS_VOL", field: "CFM_GRS_VOL" },
  { type: "number", headerName: "LBL_CFM_NET_WGT", field: "CFM_NET_WGT" },
  { type: "number", headerName: "LBL_CFM_GRS_WGT", field: "CFM_GRS_WGT" },
  { type: "number", headerName: "LBL_CFM_PLT_QTY", field: "CFM_PLT_QTY" },
  { type: "number", headerName: "LBL_CFM_RTNR_QTY", field: "CFM_RTNR_QTY" },
  { type: "number", headerName: "LBL_CFM_PBOX_QTY", field: "CFM_PBOX_QTY" },
  { type: "number", headerName: "LBL_CFM_BOX_QTY", field: "CFM_BOX_QTY" },
  { type: "number", headerName: "LBL_CONFIRMED_FLEX_QTY1", field: "CFM_FLEX_QTY1" },
  { type: "number", headerName: "LBL_CONFIRMED_FLEX_QTY2", field: "CFM_FLEX_QTY2" },
  { type: "number", headerName: "LBL_CONFIRMED_FLEX_QTY3", field: "CFM_FLEX_QTY3" },
  { type: "number", headerName: "LBL_CONFIRMED_FLEX_QTY4", field: "CFM_FLEX_QTY4" },
  { type: "number", headerName: "LBL_CONFIRMED_FLEX_QTY5", field: "CFM_FLEX_QTY5" },
  { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO" },
];


// ────────────────────────────────────────────────────────────────
// [참고] audit 컬럼 토글 — View 의 DataGrid prop 으로 제어
//
// // 1) 자동 (model.bind 사용 시 default — 모두 ON)
// <DataGrid {...model.bind("main")} columnDefs={MAIN_COLUMN_DEFS} />
//
// // 2) updatePerson 만 끄기
// <DataGrid
//   {...model.bind("main")}
//   columnDefs={MAIN_COLUMN_DEFS}
//   audit={{ updatePerson: false }}
// />
//
// // 3) 여러 필드 끄기
// <DataGrid
//   {...model.bind("main")}
//   columnDefs={MAIN_COLUMN_DEFS}
//   audit={{ updatePerson: false, updateTime: false }}
// />
//
// // 4) audit 자체 끄기
// <DataGrid {...model.bind("main")} columnDefs={MAIN_COLUMN_DEFS} audit={false} />
//
// [참고] width / fieldType 같은 개별 override 는 standardAudit 직접 호출 권장:
//   import { standardAudit } from "@/app/components/grid/columns/commonColumns";
//   const cols = [...MAIN_COLUMN_DEFS, ...standardAudit(model.grids.main.setData, {
//     insertPersonOverrides: { width: 110 },
//   })];
//   <DataGrid columnDefs={cols} audit={false} ... />   // 자동 추가 끄기
// ────────────────────────────────────────────────────────────────
