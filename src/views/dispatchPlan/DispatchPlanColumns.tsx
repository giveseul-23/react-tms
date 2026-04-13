// src/views/dispatchPlan/DispatchPlanColumns.tsx
// 배차관리(MENU_DISPATCH_PLAN) 그리드 컬럼 정의

// ── 메인 그리드: 배차 리스트 ─────────────────────────────────
export const MAIN_COLUMN_DEFS = (
  _codeMap: Record<string, Record<string, string>>,
) => [
  { headerName: "No" },
  { headerName: "LBL_REQUESTED_DELIVERY_DATE", field: "DLVRY_DT" }, // 납품요청일
  { headerName: "LBL_DISPATCH_OPERATIONAL_STATUS", field: "DSPCH_PRG_STS" }, // 배차진행상태
  { headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO" }, // 배차번호
  { headerName: "LBL_CARRIER_NAME", field: "CARR_NM" }, // 운송협력사명
  { headerName: "LBL_VEHICLE_OPERATION_TYPE", field: "VEH_OP_TP" }, // 차량운영유형
  { headerName: "LBL_VEH_NO", field: "VEH_NO" }, // 차량번호
  { headerName: "LBL_DRIVER_NAME", field: "DRVR_NM" }, // 운전자명
  { headerName: "LBL_VEHICLE_TYPE", field: "VEH_TP_CD" }, // 차량유형
  { headerName: "LBL_TTL_LD_RT", field: "PLN_LD_RT", type: "numeric" }, // 적재율
  { headerName: "LBL_MEMO", field: "MEMO_DESC" }, // 메모
  { headerName: "LBL_LANE", field: "STOP_LIST" }, // 경로
  {
    headerName: "LBL_LOADING_RATE_CBM",
    field: "PLN_NET_VOL_RT",
    type: "numeric",
  }, // 부피
  {
    headerName: "LBL_VOL",
    field: "PLN_GRS_VOL",
    type: "numeric",
  }, // 총부피
  {
    headerName: "LBL_LOADING_RATE_CBM",
    field: "PLN_GRS_VOL_RT",
    type: "numeric",
  }, // 총부피적재율
  {
    headerName: "LBL_WGT",
    field: "PLN_NET_WGT",
    type: "numeric",
  }, // 순중량
  {
    headerName: "LBL_WGT_LOADING_RATE",
    field: "PLN_NET_WGT_RT",
    type: "numeric",
  }, // 순중량적재율
  {
    headerName: "LBL_PLT_QTY",
    field: "PLN_PLT_QTY",
    type: "numeric",
  }, //팔레트수량
  {
    headerName: "LBL_PLT_QTY_LOADING_RATE",
    field: "PLN_PLT_RT",
    type: "numeric",
  }, //팔레트수량적재율
  {
    headerName: "LBL_RTNR_QTY",
    field: "PLN_RTNR_QTY",
    type: "numeric",
  }, //롤테이너수량
  {
    headerName: "LBL_RTNR_QTY_LOADING_RATE",
    field: "PLN_RTNR_RT",
    type: "numeric",
  }, //롤테이너수량적재율
  {
    headerName: "LBL_PBOX_QTY",
    field: "PLN_PBOX_QTY",
    type: "numeric",
  }, //PBOX수량
  {
    headerName: "LBL_PBOX_QTY_LOADING_RATE",
    field: "PLN_PBOX_RT",
    type: "numeric",
  }, //PBOX수량적재율
  {
    headerName: "LBL_BOX_QTY",
    field: "PLN_BOX_QTY",
    type: "numeric",
  }, //BOX수량
  {
    headerName: "LBL_BOX_QTY_LOADING_RATE",
    field: "PLN_BOX_RT",
    type: "numeric",
  }, //BOX수량적재율
  {
    headerName: "LBL_FLEX_QTY1",
    field: "PLN_FLEX_QTY1",
    type: "numeric",
  }, //계획FQ1
  {
    headerName: "LBL_LOADING_RATE_FLEX_QTY1",
    field: "PLN_FLEX_QTY1_RT",
    type: "numeric",
  }, //FQ1적재율
  {
    headerName: "LBL_FLEX_QTY2",
    field: "PLN_FLEX_QTY2",
    type: "numeric",
  }, //계획FQ2
  {
    headerName: "LBL_LOADING_RATE_FLEX_QTY2",
    field: "PLN_FLEX_QTY2_RT",
    type: "numeric",
  }, //FQ2적재율
  {
    headerName: "LBL_FLEX_QTY3",
    field: "PLN_FLEX_QTY3",
    type: "numeric",
  }, //계획FQ3
  {
    headerName: "LBL_LOADING_RATE_FLEX_QTY3",
    field: "PLN_FLEX_QTY3_RT",
    type: "numeric",
  }, //FQ3적재율
  {
    headerName: "LBL_FLEX_QTY4",
    field: "PLN_FLEX_QTY4",
    type: "numeric",
  }, //계획FQ4
  {
    headerName: "LBL_LOADING_RATE_FLEX_QTY4",
    field: "PLN_FLEX_QTY4_RT",
    type: "numeric",
  }, //FQ4적재율
  {
    headerName: "LBL_FLEX_QTY5",
    field: "PLN_FLEX_QTY5",
    type: "numeric",
  }, //계획FQ5
  {
    headerName: "LBL_LOADING_RATE_FLEX_QTY5",
    field: "PLN_FLEX_QTY5_RT",
    type: "numeric",
  }, //FQ5적재율
  {
    headerName: "LBL_STOP_CNT",
    field: "PLN_STOP_CNT",
    type: "numeric",
  }, //경유처수
  {
    headerName: "LBL_DISPATCH_PLAN_TYPE",
    field: "DSPCH_TP",
  }, //배차유형
  {
    headerName: "LBL_CONST_OVRD_YN",
    field: "CONSTRAINT_OVRD_YN",
  }, //제약해제여부
  {
    headerName: "LBL_TRIP_COUNT",
    field: "RTN_NO",
    type: "numeric",
  }, //회전수
  {
    headerName: "LBL_TRIP_NO",
    field: "TRIP_ID",
    type: "numeric",
  }, //연계배차번호
  {
    headerName: "LBL_TRIP_SEQ",
    field: "TRIP_SEQ",
    type: "numeric",
  }, //연계배차순서
  { headerName: "LBL_ROW_STATUS", field: "EDIT_STS" },
  {
    headerName: "LBL_INSERT_PERSON_ID",
    field: "CRE_USR_ID",
  },
  {
    headerName: "LBL_INSERT_DATE",
    field: "CRE_DTTM",
    fieldType: "text",
  },
  {
    headerName: "LBL_UPDATE_PERSON_ID",
    field: "UPD_USR_ID",
  },
  {
    headerName: "LBL_UPDATE_TIME",
    field: "UPD_DTTM",
  },
];

// ── 경유처 탭 ────────────────────────────────────────────────
export const STOP_COLUMN_DEFS = [
  { headerName: "LBL_STOP_SEQUENCE", field: "STOP_SEQ" }, // 순번
  { headerName: "LBL_LOCATION_CODE", field: "LOC_CD" }, // 착지코드
  { headerName: "LBL_LOCATION_NAME", field: "LOC_NM" }, // 착지명
  { headerName: "LBL_DETAIL_ADDRESS1", field: "DTL_ADDR1" }, // 상세주소1
  { headerName: "LBL_PICKDROP_DIV", field: "STOP_TP" }, // 착지구분
  { headerName: "LBL_ETA_DTTM", field: "ETA_DTTM" }, // 예상도착시간
  { headerName: "LBL_ETD_DTTM", field: "ETD_DTTM" }, // 예상출발시간
  { headerName: "LBL_ATA_DTTM", field: "ATA_DTTM" }, // 도착시각
  { headerName: "LBL_ATD_DTTM", field: "ATD_DTTM" }, // 출발시각
  {
    headerName: "LBL_TRNST_PREVSTOP_DIST",
    field: "TRNST_PREVSTOP_DIST",
    type: "numeric",
  }, // 직전이동거리
];

// ── 할당주문 탭 ──────────────────────────────────────────────
export const ALLOC_ORDER_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_DEPARTURE_NAME", field: "FRM_LOC_NM" }, // 출발지명
  { headerName: "LBL_DESTINATION_NAME", field: "TO_LOC_NM" }, // 도착지명
  { headerName: "LBL_TO_DETAIL_ADDRESS_1", field: "TO_DTL_ADDR1" }, // 도착지상세주소1
  { headerName: "LBL_DESTINATION_ZIP_CODE", field: "TO_ZIP_CD" }, // 도착지우편번호
  { headerName: "LBL_ORDER_TYPE", field: "ORD_TP" }, // 주문유형
  { headerName: "LBL_ITEM_UOM", field: "QTY" }, // 품목단위
  { headerName: "LBL_VOL", field: "PLN_VOL", type: "numeric" }, //계획CBM
  { headerName: "LBL_WGT", field: "PLN_WGT", type: "numeric" }, //계획중량
  { headerName: "LBL_FLEX_QTY1", field: "PLN_FLEX_QTY1", type: "numeric" }, //계획FQ1
  { headerName: "LBL_FLEX_QTY2", field: "PLN_FLEX_QTY2", type: "numeric" }, //계획FQ2
  { headerName: "LBL_FLEX_QTY3", field: "PLN_FLEX_QTY3", type: "numeric" }, //계획FQ3
  { headerName: "LBL_FLEX_QTY4", field: "PLN_FLEX_QTY4", type: "numeric" }, //계획FQ4
  { headerName: "LBL_FLEX_QTY5", field: "PLN_FLEX_QTY5", type: "numeric" }, //계획FQ5
  { headerName: "LBL_CUSTOMER_ORDER_NO", field: "CUST_ORD_NO" }, //고객주문번호
  { headerName: "LBL_ORDER_NO", field: "ORD_NO" }, //주문번호
  { headerName: "LBL_SHIPMENT_NUMBER", field: "SHPM_NO" }, //운송주문번호
  { headerName: "LBL_DESTINATION_CODE", field: "TO_LOC_CD" }, //도착지코드
  { headerName: "LBL_DEPARTURE_CODE", field: "FRM_LOC_CD" }, //출발지코드
  { headerName: "LBL_FRM_DETAIL_ADDRESS_1", field: "FRM_DTL_ADDR1" }, //출발지 상세주소 1
  { headerName: "LBL_DEPARTURE_ZIP_CODE", field: "FRM_ZIP_CD" }, //출발지 우편번호
  { headerName: "LBL_SHPM_RMRK", field: "SHPM_RSN_DESC" }, //주문비고
  { headerName: "LBL_SOLD_TO_CD", field: "SOLD_TO_CD" }, //거래처코드
  { headerName: "LBL_SOLD_TO_NM", field: "SOLD_TO_NM" }, //거래처명
  { headerName: "LBL_CUST_PICKUP_YN", field: "CUST_PICKUP_YN" }, //고객사 픽업 여부
];

// ── 할당주문 탭 · SUB(품목) 그리드 ───────────────────────────
export const ALLOC_ORDER_SUB_COLUMN_DEFS = [
  { headerName: "LBL_ITEM_LINE", field: "ITM_LN_SEQ" }, // 품목라인
  { headerName: "LBL_ITEM_CODE", field: "ITM_CD" }, // 품목코드
  { headerName: "LBL_ITEM_NAME", field: "ITM_NM" }, // 품목명
  { headerName: "LBL_PLN_ORD_QTY", field: "PLN_ORD_QTY", type: "numeric" }, // 계획주문수량
  { headerName: "LBL_PLN_ORD_QTY_UOM", field: "PLN_ORD_QTY_UOM" }, // 계획주문수량UOM
  { headerName: "LBL_PLN_STOCK_QTY", field: "PLN_STOCK_QTY", type: "numeric" }, // 계획재고수량
];

// ── 미할당주문 탭 ────────────────────────────────────────────
export const UNALLOC_ORDER_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "LBL_DEPARTURE_NAME", field: "FRM_LOC_NM" }, // 출발지명
  { headerName: "LBL_DESTINATION_NAME", field: "TO_LOC_NM" }, // 도착지명
  { headerName: "LBL_TO_DETAIL_ADDRESS_1", field: "TO_DTL_ADDR1" }, // 도착지상세주소1
  { headerName: "LBL_DESTINATION_ZIP_CODE", field: "TO_ZIP_CD" }, // 도착지우편번호
  { headerName: "LBL_ORDER_TYPE", field: "ORD_TP" }, // 주문유형
  { headerName: "LBL_ITEM_UOM", field: "QTY" }, // 품목단위
  { headerName: "LBL_VOL", field: "PLN_VOL", type: "numeric" }, //계획CBM
  { headerName: "LBL_WGT", field: "PLN_WGT", type: "numeric" }, //계획중량
  { headerName: "LBL_FLEX_QTY1", field: "PLN_FLEX_QTY1", type: "numeric" }, //계획FQ1
  { headerName: "LBL_FLEX_QTY2", field: "PLN_FLEX_QTY2", type: "numeric" }, //계획FQ2
  { headerName: "LBL_FLEX_QTY3", field: "PLN_FLEX_QTY3", type: "numeric" }, //계획FQ3
  { headerName: "LBL_FLEX_QTY4", field: "PLN_FLEX_QTY4", type: "numeric" }, //계획FQ4
  { headerName: "LBL_FLEX_QTY5", field: "PLN_FLEX_QTY5", type: "numeric" }, //계획FQ5
  { headerName: "LBL_CUSTOMER_ORDER_NO", field: "CUST_ORD_NO" }, //고객주문번호
  { headerName: "LBL_ORDER_NO", field: "ORD_NO" }, //주문번호
  { headerName: "LBL_SHIPMENT_NUMBER", field: "SHPM_NO" }, //운송주문번호
  { headerName: "LBL_DESTINATION_CODE", field: "TO_LOC_CD" }, //도착지코드
  { headerName: "LBL_DEPARTURE_CODE", field: "FRM_LOC_CD" }, //출발지코드
  { headerName: "LBL_FRM_DETAIL_ADDRESS_1", field: "FRM_DTL_ADDR1" }, //출발지 상세주소 1
  { headerName: "LBL_DEPARTURE_ZIP_CODE", field: "FRM_ZIP_CD" }, //출발지 우편번호
  { headerName: "LBL_SHPM_RMRK", field: "SHPM_RSN_DESC" }, //주문비고
  { headerName: "LBL_SOLD_TO_CD", field: "SOLD_TO_CD" }, //거래처코드
  { headerName: "LBL_SOLD_TO_NM", field: "SOLD_TO_NM" }, //거래처명
  { headerName: "LBL_CUST_PICKUP_YN", field: "CUST_PICKUP_YN" }, //고객사 픽업 여부
];

// ── 미할당주문 탭 · SUB(품목) 그리드 ─────────────────────────
export const UNALLOC_ORDER_SUB_COLUMN_DEFS = [
  { headerName: "LBL_ITEM_LINE", field: "ITM_LN_SEQ" }, // 품목라인
  { headerName: "LBL_ITEM_CODE", field: "ITM_CD" }, // 품목코드
  { headerName: "LBL_ITEM_NAME", field: "ITM_NM" }, // 품목명
  { headerName: "LBL_PLN_ORD_QTY", field: "PLN_ORD_QTY", type: "numeric" }, // 계획주문수량
  { headerName: "LBL_PLN_ORD_QTY_UOM", field: "PLN_ORD_QTY_UOM" }, // 계획주문수량UOM
  { headerName: "LBL_PLN_STOCK_QTY", field: "PLN_STOCK_QTY", type: "numeric" }, // 계획재고수량
];
