import { numberValueFormatter } from "@/app/components/grid/columns/commonFormatters";

// ── 메인 그리드: 배차 리스트 ─────────────────────────────────
export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "date",
    headerName: "LBL_REQUESTED_DELIVERY_DATE",
    field: "DLVRY_DT",
  }, // 납품요청일
  {
    type: "combo",
    headerName: "LBL_DISPATCH_OPERATIONAL_STATUS",
    field: "DSPCH_OP_STS",
    codeKey: "dspchOpSts",
  }, // 배차진행상태
  {
    type: "text",
    headerName: "LBL_DISPATCH_NO",
    field: "DSPCH_NO",
    align: "center",
  }, // 배차번호
  { type: "text", headerName: "LBL_CARRIER_NAME", field: "CARR_NM" }, // 운송협력사명
  {
    type: "combo",
    headerName: "LBL_VEHICLE_OPERATION_TYPE",
    field: "VEH_OP_TP",
    codeKey: "vehOpTp",
  }, // 차량운영유형
  { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO" }, // 차량번호
  { type: "text", headerName: "LBL_DRIVER_NAME", field: "DRVR_NM" }, // 운전자명
  { type: "text", headerName: "LBL_VEHICLE_TYPE", field: "VEH_TP_CD" }, // 차량유형
  {
    headerName: "LBL_TTL_LD_RT",
    field: "PLN_LD_RT",
    type: "numeric",
    decimalPlaces: 1,
  }, // 적재율
  { type: "text", headerName: "LBL_MEMO", field: "MEMO_DESC" }, // 메모
  { type: "text", headerName: "LBL_LANE", field: "STOP_LIST" }, // 경로
  {
    headerName: "LBL_VOL",
    field: "PLN_NET_VOL",
    type: "numeric",
    decimalPlaces: 1,
    summable: true,
    valueFormatter: numberValueFormatter,
    validators: {
      pointLength: 4,
    },
  }, // 부피
  {
    headerName: "LBL_LOADING_RATE_CBM",
    field: "PLN_NET_VOL_RT",
    type: "numeric",
    decimalPlaces: 1,
  }, // 부피
  {
    headerName: "LBL_VOL",
    field: "PLN_GRS_VOL",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
    validators: {
      pointLength: 4,
    },
  },
  {
    headerName: "LBL_LOADING_RATE_CBM",
    field: "PLN_GRS_VOL_RT",
    type: "numeric",
    decimalPlaces: 1,
  }, // 총부피적재율
  {
    headerName: "LBL_WGT",
    field: "PLN_NET_WGT",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
    validators: {
      pointLength: 4,
    },
  }, // 순중량
  {
    headerName: "LBL_WGT_LOADING_RATE",
    field: "PLN_NET_WGT_RT",
    type: "numeric",
    decimalPlaces: 1,
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
    decimalPlaces: 1,
    summable: true,
    valueFormatter: numberValueFormatter,
    validators: {
      pointLength: 4,
    },
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
    decimalPlaces: 1,
    summable: true,
    valueFormatter: numberValueFormatter,
    validators: {
      pointLength: 4,
    },
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
    decimalPlaces: 1,
    summable: true,
    valueFormatter: numberValueFormatter,
    validators: {
      pointLength: 4,
    },
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
    decimalPlaces: 1,
    summable: true,
    valueFormatter: numberValueFormatter,
    validators: {
      pointLength: 4,
    },
  }, //BOX수량적재율
  {
    headerName: "LBL_FLEX_QTY1",
    field: "PLN_FLEX_QTY1",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
    validators: {
      pointLength: 4,
    },
  }, //계획FQ1
  {
    headerName: "LBL_LOADING_RATE_FLEX_QTY1",
    field: "PLN_FLEX_QTY1_RT",
    type: "numeric",
    decimalPlaces: 1,
  }, //FQ1적재율
  {
    headerName: "LBL_FLEX_QTY2",
    field: "PLN_FLEX_QTY2",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
    validators: {
      pointLength: 4,
    },
  }, //계획FQ2
  {
    headerName: "LBL_LOADING_RATE_FLEX_QTY2",
    field: "PLN_FLEX_QTY2_RT",
    type: "numeric",
    decimalPlaces: 1,
  }, //FQ2적재율
  {
    headerName: "LBL_FLEX_QTY3",
    field: "PLN_FLEX_QTY3",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
    validators: {
      pointLength: 4,
    },
  }, //계획FQ3
  {
    headerName: "LBL_LOADING_RATE_FLEX_QTY3",
    field: "PLN_FLEX_QTY3_RT",
    type: "numeric",
    decimalPlaces: 1,
  }, //FQ3적재율
  {
    headerName: "LBL_FLEX_QTY4",
    field: "PLN_FLEX_QTY4",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
    validators: {
      pointLength: 4,
    },
  }, //계획FQ4
  {
    headerName: "LBL_LOADING_RATE_FLEX_QTY4",
    field: "PLN_FLEX_QTY4_RT",
    type: "numeric",
    decimalPlaces: 1,
  }, //FQ4적재율
  {
    headerName: "LBL_FLEX_QTY5",
    field: "PLN_FLEX_QTY5",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
    validators: {
      pointLength: 4,
    },
  }, //계획FQ5
  {
    headerName: "LBL_LOADING_RATE_FLEX_QTY5",
    field: "PLN_FLEX_QTY5_RT",
    type: "numeric",
    decimalPlaces: 1,
  }, //FQ5적재율
  {
    headerName: "LBL_STOP_CNT",
    field: "PLN_STOP_CNT",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  }, //경유처수
  {
    type: "combo",
    headerName: "LBL_DISPATCH_PLAN_TYPE",
    field: "DSPCH_TP",
    codeKey: "dspchTpList",
  }, //배차유형
  {
    type: "check",
    headerName: "LBL_CONST_OVRD_YN",
    field: "CONSTRAINT_OVRD_YN",
    editable: true,
  }, //제약해제여부
  {
    type: "combo",
    headerName: "LBL_CONST_OVRD_RSN_CD",
    field: "CONSTRAINT_OVRD_RSN_CD",
    editable: true,
    codeKey: "constraintOvrdCdList",
    //todo : 제약해제 여부 Y인경우 값을 무조건 넣을수있도록 validator 추가
  }, //제약해제사유코드
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
];

// ── 경유처 탭 ────────────────────────────────────────────────
export const STOP_COLUMN_DEFS = [
  { type: "numeric", headerName: "LBL_STOP_SEQUENCE", field: "STOP_SEQ" }, // 순번
  { type: "text", headerName: "LBL_LOCATION_CODE", field: "LOC_CD" }, // 착지코드
  { type: "text", headerName: "LBL_LOCATION_NAME", field: "LOC_NM" }, // 착지명
  { type: "text", headerName: "LBL_DETAIL_ADDRESS1", field: "DTL_ADDR1" }, // 상세주소1
  {
    type: "combo",
    headerName: "LBL_PICKDROP_DIV",
    field: "STOP_TP",
    codeKey: "stopTpList",
    align: "center",
  }, // 착지구분
  { type: "datetime", headerName: "LBL_ETA_DTTM", field: "ETA_DTTM" }, // 예상도착시간
  { type: "datetime", headerName: "LBL_ETD_DTTM", field: "ETD_DTTM" }, // 예상출발시간
  { type: "datetime", headerName: "LBL_ATA_DTTM", field: "ATA_DTTM" }, // 도착시각
  { type: "datetime", headerName: "LBL_ATD_DTTM", field: "ATD_DTTM" }, // 출발시각
  {
    headerName: "LBL_TRNST_PREVSTOP_DIST",
    field: "TRNST_PREVSTOP_DIST",
    type: "numeric",
  }, // 직전이동거리
];

// ── 할당주문 탭 ──────────────────────────────────────────────
export const ALLOC_ORDER_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_DEPARTURE_NAME", field: "FRM_LOC_NM" }, // 출발지명
  { type: "text", headerName: "LBL_DESTINATION_NAME", field: "TO_LOC_NM" }, // 도착지명
  {
    type: "text",
    headerName: "LBL_TO_DETAIL_ADDRESS_1",
    field: "TO_DTL_ADDR1",
  }, // 도착지상세주소1
  { type: "text", headerName: "LBL_DESTINATION_ZIP_CODE", field: "TO_ZIP_CD" }, // 도착지우편번호
  {
    type: "combo",
    headerName: "LBL_ORDER_TYPE",
    field: "ORD_TP",
    codeKey: "ordTpList",
    align: "center",
  }, // 주문유형
  { type: "numeric", headerName: "LBL_ITEM_UOM", field: "QTY" }, // 품목단위
  {
    headerName: "LBL_VOL",
    field: "PLN_VOL",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  }, //계획CBM
  {
    headerName: "LBL_WGT",
    field: "PLN_WGT",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  }, //계획중량
  {
    headerName: "LBL_FLEX_QTY1",
    field: "PLN_FLEX_QTY1",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  }, //계획FQ1
  {
    headerName: "LBL_FLEX_QTY2",
    field: "PLN_FLEX_QTY2",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  }, //계획FQ2
  {
    headerName: "LBL_FLEX_QTY3",
    field: "PLN_FLEX_QTY3",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  }, //계획FQ3
  {
    headerName: "LBL_FLEX_QTY4",
    field: "PLN_FLEX_QTY4",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  }, //계획FQ4
  {
    headerName: "LBL_FLEX_QTY5",
    field: "PLN_FLEX_QTY5",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  }, //계획FQ5
  { type: "text", headerName: "LBL_CUSTOMER_ORDER_NO", field: "CUST_ORD_NO" }, //고객주문번호
  { type: "text", headerName: "LBL_ORDER_NO", field: "ORD_NO" }, //주문번호
  { type: "text", headerName: "LBL_SHIPMENT_NUMBER", field: "SHPM_NO" }, //운송주문번호
  { type: "text", headerName: "LBL_DESTINATION_CODE", field: "TO_LOC_CD" }, //도착지코드
  { type: "text", headerName: "LBL_DEPARTURE_CODE", field: "FRM_LOC_CD" }, //출발지코드
  {
    type: "text",
    headerName: "LBL_FRM_DETAIL_ADDRESS_1",
    field: "FRM_DTL_ADDR1",
  }, //출발지 상세주소 1
  { type: "text", headerName: "LBL_DEPARTURE_ZIP_CODE", field: "FRM_ZIP_CD" }, //출발지 우편번호
  { type: "text", headerName: "LBL_SHPM_RMRK", field: "SHPM_RSN_DESC" }, //주문비고
  { type: "text", headerName: "LBL_SOLD_TO_CD", field: "SOLD_TO_CD" }, //거래처코드
  { type: "text", headerName: "LBL_SOLD_TO_NM", field: "SOLD_TO_NM" }, //거래처명
  { type: "check", headerName: "LBL_CUST_PICKUP_YN", field: "CUST_PICKUP_YN" }, //고객사 픽업 여부
];

// ── 할당주문 탭 · SUB(품목) 그리드 ───────────────────────────
export const ALLOC_ORDER_SUB_COLUMN_DEFS = [
  { type: "text", headerName: "LBL_ORD_ITM_LINE_NO", field: "ORD_LINE_NO" }, // 품목라인
  { type: "text", headerName: "LBL_ITEM_CD", field: "CUST_ITEM_CD" }, // 품목코드
  { type: "text", headerName: "LBL_ITEM_NM", field: "CUST_ITEM_NM" }, // 품목명
  { headerName: "LBL_PLN_ORD_QTY", field: "PLN_ORD_QTY", type: "numeric" }, // 계획주문수량
  {
    type: "combo",
    headerName: "LBL_PLN_ORD_QTY_UOM",
    field: "PLN_ORD_QTY_UOM",
    codeKey: "itmUomList",
  }, // 계획주문수량UOM
  { headerName: "LBL_PLN_INV_QTY", field: "PLN_INV_QTY", type: "numeric" }, // 계획재고수량
  {
    type: "combo",
    headerName: "LBL_PLN_INV_QTY_UOM",
    field: "PLN_INV_QTY_UOM",
    codeKey: "itmUomList",
  }, // 계획재고수량
  {
    headerName: "LBL_PLN_NET_WGT",
    field: "PLN_NET_WGT",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_PLN_GRS_WGT",
    field: "PLN_GRS_WGT",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_PLN_PLT_QTY",
    field: "PLN_PLT_QTY",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_PLN_RTNR_QTY",
    field: "PLN_RTNR_QTY",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_PLN_PBOX_QTY",
    field: "PLN_PBOX_QTY",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_PLN_BOX_QTY",
    field: "PLN_BOX_QTY",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_PLANNED_FLEX_QTY1",
    field: "PLN_FLEX_QTY1",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_PLANNED_FLEX_QTY2",
    field: "PLN_FLEX_QTY2",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_PLANNED_FLEX_QTY3",
    field: "PLN_FLEX_QTY4",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_PLANNED_FLEX_QTY4",
    field: "PLN_FLEX_QTY4",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_PLANNED_FLEX_QTY5",
    field: "PLN_FLEX_QTY5",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_CFM_ORD_QTY",
    field: "CFM_ORD_QTY_UOM",
    type: "numeric",
  },
  {
    headerName: "LBL_CFM_INV_QTY",
    field: "CFM_INV_QTY",
    type: "numeric",
  },
  {
    headerName: "LBL_CFM_INV_QTY_UOM",
    field: "CFM_INV_QTY_UOM",
    type: "combo",
    codeKey: "itmUomList",
  },
  {
    headerName: "LBL_CFM_NET_WGT",
    field: "CFM_NET_WGT",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_CFM_GRS_WGT",
    field: "CFM_GRS_WGT",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_CFM_PLT_QTY",
    field: "CFM_PLT_QTY",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_CFM_RTNR_QTY",
    field: "CFM_RTNR_QTY",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_CFM_PBOX_QTY",
    field: "CFM_PBOX_QTY",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_CFM_BOX_QTY",
    field: "CFM_BOX_QTY",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_CONFIRMED_FLEX_QTY1",
    field: "CFM_FLEX_QTY1",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_CONFIRMED_FLEX_QTY2",
    field: "CFM_FLEX_QTY2",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_CONFIRMED_FLEX_QTY3",
    field: "CFM_FLEX_QTY3",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_CONFIRMED_FLEX_QTY4",
    field: "CFM_FLEX_QTY4",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_CONFIRMED_FLEX_QTY5",
    field: "CFM_FLEX_QTY5",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  { type: "text", headerName: "LBL_ITEM_REMARK", field: "SHPM_DTL_RSN_DESC" },
  { type: "text", headerName: "LBL_FEED_FCD", field: "ITEM_FCD" },
  {
    type: "combo",
    headerName: "LBL_TEMPER_ZONE",
    field: "TEMP_TCD",
    codeKey: "vehTempTcd",
  },
];

// ── 할당주문 탭 · 품목(ITEM) 단일 그리드 ─────────────────────
export const ALLOC_ORDER_ITEM_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_ITEM_CD",
    field: "CUST_ITEM_CD",
    align: "center",
  }, // 품목코드
  { type: "text", headerName: "LBL_ITEM_NM", field: "CUST_ITEM_NM" }, // 품목명
  {
    type: "combo",
    headerName: "LBL_ORDER_TYPE",
    field: "ORD_TP",
    codeKey: "ordTpList",
    align: "center",
  }, // 주문유형
  { type: "numeric", headerName: "LBL_PLN_ORD_QTY", field: "PLN_ORD_QTY" }, // 계획주문수량
  {
    type: "combo",
    headerName: "LBL_PLN_ORD_QTY_UOM",
    field: "PLN_ORD_QTY_UOM",
    codeKey: "itmUomList",
    align: "center",
  }, // 계획주문수량UOM
  { type: "numeric", headerName: "LBL_PLN_INV_QTY", field: "PLN_INV_QTY" }, // 계획재고수량
  {
    type: "combo",
    headerName: "LBL_PLN_INV_QTY_UOM",
    field: "PLN_INV_QTY_UOM",
    codeKey: "itmUomList",
    align: "center",
  }, // 계획재고수량UOM
  {
    headerName: "LBL_PLN_NET_WGT",
    field: "PLN_NET_WGT",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  }, // 계획순중량
  {
    headerName: "LBL_PLN_GRS_WGT",
    field: "PLN_GRS_WGT",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  }, // 계획총중량
  {
    headerName: "LBL_PLN_PLT_QTY",
    field: "PLN_PLT_QTY",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  }, // 계획팔레트수량
  {
    headerName: "LBL_PLN_RTNR_QTY",
    field: "PLN_RTNR_QTY",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  }, // 계획롤테이너수량
  {
    headerName: "LBL_PLN_PBOX_QTY",
    field: "PLN_PBOX_QTY",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  }, // 계획PBOX수량
  {
    headerName: "LBL_PLN_BOX_QTY",
    field: "PLN_BOX_QTY",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  }, // 계획BOX수량
  {
    headerName: "LBL_PLANNED_FLEX_QTY1",
    field: "PLN_FLEX_QTY1",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  }, // 계획FQ1
  {
    headerName: "LBL_PLANNED_FLEX_QTY2",
    field: "PLN_FLEX_QTY2",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  }, // 계획FQ2
  {
    headerName: "LBL_PLANNED_FLEX_QTY3",
    field: "PLN_FLEX_QTY3",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  }, // 계획FQ3
  {
    headerName: "LBL_PLANNED_FLEX_QTY4",
    field: "PLN_FLEX_QTY4",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  }, // 계획FQ4
  {
    headerName: "LBL_PLANNED_FLEX_QTY5",
    field: "PLN_FLEX_QTY5",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  }, // 계획FQ5
  {
    type: "combo",
    headerName: "LBL_TEMP_CAL_OPT",
    field: "TEMP_TCD",
    codeKey: "vehTempTcd",
    align: "center",
  }, // 온도조건
  {
    type: "text",
    headerName: "LBL_ITEM_REMARK",
    field: "SHPM_DTL_RSN_DESC",
  }, // 품목비고사항
];

// ── 미할당주문 탭 ────────────────────────────────────────────
export const UNALLOC_ORDER_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_DEPARTURE_NAME", field: "FRM_LOC_NM" }, // 출발지명
  { type: "text", headerName: "LBL_DESTINATION_NAME", field: "TO_LOC_NM" }, // 도착지명
  {
    type: "text",
    headerName: "LBL_TO_DETAIL_ADDRESS_1",
    field: "TO_DTL_ADDR1",
  }, // 도착지상세주소1
  { type: "text", headerName: "LBL_DESTINATION_ZIP_CODE", field: "TO_ZIP_CD" }, // 도착지우편번호
  {
    type: "combo",
    headerName: "LBL_ORDER_TYPE",
    field: "ORD_TP",
    codeKey: "ordTpList",
    align: "center",
  }, // 주문유형
  { type: "numeric", headerName: "LBL_ITEM_UOM", field: "QTY" }, // 품목단위
  {
    headerName: "LBL_VOL",
    field: "PLN_VOL",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  }, //계획CBM
  {
    headerName: "LBL_WGT",
    field: "PLN_WGT",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  }, //계획중량
  {
    headerName: "LBL_FLEX_QTY1",
    field: "PLN_FLEX_QTY1",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  }, //계획FQ1
  {
    headerName: "LBL_FLEX_QTY2",
    field: "PLN_FLEX_QTY2",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  }, //계획FQ2
  {
    headerName: "LBL_FLEX_QTY3",
    field: "PLN_FLEX_QTY3",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  }, //계획FQ3
  {
    headerName: "LBL_FLEX_QTY4",
    field: "PLN_FLEX_QTY4",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  }, //계획FQ4
  {
    headerName: "LBL_FLEX_QTY5",
    field: "PLN_FLEX_QTY5",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  }, //계획FQ5
  { type: "text", headerName: "LBL_CUSTOMER_ORDER_NO", field: "CUST_ORD_NO" }, //고객주문번호
  { type: "text", headerName: "LBL_ORDER_NO", field: "ORD_NO" }, //주문번호
  { type: "text", headerName: "LBL_SHIPMENT_NUMBER", field: "SHPM_NO" }, //운송주문번호
  { type: "text", headerName: "LBL_DESTINATION_CODE", field: "TO_LOC_CD" }, //도착지코드
  { type: "text", headerName: "LBL_DEPARTURE_CODE", field: "FRM_LOC_CD" }, //출발지코드
  {
    type: "text",
    headerName: "LBL_FRM_DETAIL_ADDRESS_1",
    field: "FRM_DTL_ADDR1",
  }, //출발지 상세주소 1
  { type: "text", headerName: "LBL_DEPARTURE_ZIP_CODE", field: "FRM_ZIP_CD" }, //출발지 우편번호
  { type: "text", headerName: "LBL_SHPM_RMRK", field: "SHPM_RSN_DESC" }, //주문비고
  { type: "text", headerName: "LBL_SOLD_TO_CD", field: "SOLD_TO_CD" }, //거래처코드
  { type: "text", headerName: "LBL_SOLD_TO_NM", field: "SOLD_TO_NM" }, //거래처명
  { type: "check", headerName: "LBL_CUST_PICKUP_YN", field: "CUST_PICKUP_YN" }, //고객사 픽업 여부
];

// ── 미할당주문 탭 · SUB(품목) 그리드 ─────────────────────────
export const UNALLOC_ORDER_SUB_COLUMN_DEFS = [
  { type: "text", headerName: "LBL_ORD_ITM_LINE_NO", field: "ORD_LINE_NO" }, // 품목라인
  { type: "text", headerName: "LBL_ITEM_CD", field: "CUST_ITEM_CD" }, // 품목코드
  { type: "text", headerName: "LBL_ITEM_NM", field: "CUST_ITEM_NM" }, // 품목명
  { headerName: "LBL_PLN_ORD_QTY", field: "PLN_ORD_QTY", type: "numeric" }, // 계획주문수량
  {
    type: "combo",
    headerName: "LBL_PLN_ORD_QTY_UOM",
    field: "PLN_ORD_QTY_UOM",
    codeKey: "itmUomList",
  }, // 계획주문수량UOM
  { headerName: "LBL_PLN_INV_QTY", field: "PLN_INV_QTY", type: "numeric" }, // 계획재고수량
  {
    type: "combo",
    headerName: "LBL_PLN_INV_QTY_UOM",
    field: "PLN_INV_QTY_UOM",
    codeKey: "itmUomList",
  }, // 계획재고수량
  {
    headerName: "LBL_PLN_NET_WGT",
    field: "PLN_NET_WGT",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_PLN_GRS_WGT",
    field: "PLN_GRS_WGT",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_PLN_PLT_QTY",
    field: "PLN_PLT_QTY",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_PLN_RTNR_QTY",
    field: "PLN_RTNR_QTY",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_PLN_PBOX_QTY",
    field: "PLN_PBOX_QTY",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_PLN_BOX_QTY",
    field: "PLN_BOX_QTY",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_PLANNED_FLEX_QTY1",
    field: "PLN_FLEX_QTY1",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_PLANNED_FLEX_QTY2",
    field: "PLN_FLEX_QTY2",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_PLANNED_FLEX_QTY3",
    field: "PLN_FLEX_QTY4",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_PLANNED_FLEX_QTY4",
    field: "PLN_FLEX_QTY4",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_PLANNED_FLEX_QTY5",
    field: "PLN_FLEX_QTY5",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_CFM_ORD_QTY",
    field: "CFM_ORD_QTY_UOM",
    type: "numeric",
  },
  {
    headerName: "LBL_CFM_INV_QTY",
    field: "CFM_INV_QTY",
    type: "numeric",
  },
  {
    headerName: "LBL_CFM_INV_QTY_UOM",
    field: "CFM_INV_QTY_UOM",
    type: "combo",
    codeKey: "itmUomList",
  },
  {
    headerName: "LBL_CFM_NET_WGT",
    field: "CFM_NET_WGT",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_CFM_GRS_WGT",
    field: "CFM_GRS_WGT",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_CFM_PLT_QTY",
    field: "CFM_PLT_QTY",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_CFM_RTNR_QTY",
    field: "CFM_RTNR_QTY",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_CFM_PBOX_QTY",
    field: "CFM_PBOX_QTY",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_CFM_BOX_QTY",
    field: "CFM_BOX_QTY",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_CONFIRMED_FLEX_QTY1",
    field: "CFM_FLEX_QTY1",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_CONFIRMED_FLEX_QTY2",
    field: "CFM_FLEX_QTY2",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_CONFIRMED_FLEX_QTY3",
    field: "CFM_FLEX_QTY3",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_CONFIRMED_FLEX_QTY4",
    field: "CFM_FLEX_QTY4",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  {
    headerName: "LBL_CONFIRMED_FLEX_QTY5",
    field: "CFM_FLEX_QTY5",
    type: "numeric",
    summable: true,
    valueFormatter: numberValueFormatter,
  },
  { type: "text", headerName: "LBL_ITEM_REMARK", field: "SHPM_DTL_RSN_DESC" },
  { type: "text", headerName: "LBL_FEED_FCD", field: "ITEM_FCD" },
  {
    type: "combo",
    headerName: "LBL_TEMPER_ZONE",
    field: "TEMP_TCD",
    codeKey: "vehTempTcd",
  },
];

//차량정보
export const VEH_MGMT_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_TON_TYPE",
    field: "VEH_TP_NM",
  }, // 톤수
  {
    type: "text",
    headerName: "LBL_VEH_NO",
    field: "VEH_NO",
  }, // 차량번호
  {
    headerName: "LBL_DRIVER_NAME",
    field: "DRVR_NM",
    type: "text",
  }, // 운전자명
  { type: "text", headerName: "LBL_CARRIER", field: "CARR_NM" }, // 수행운수사
  {
    headerName: "LBL_DISPATCH_YN",
    field: "DSPCH_YN",
    type: "text",
  }, // 배차여부
  {
    type: "numeric",
    headerName: "LBL_DISPATCH_COUNT",
    field: "DSPCH_CNT",
  },
  {
    headerName: "LBL_VEH_TRANS_TCD",
    field: "TRANS_TCD",
    type: "combo",
    codeKey: "transTcd",
  },
  {
    headerName: "LBL_TEMPERATURE_CLASSIFICATION",
    field: "VEH_TEMP_TCD",
    type: "combo",
    codeKey: "vehTempTcd",
  },
  {
    headerName: "LBL_VEH_GRP",
    field: "VEH_GRP_CD",
    type: "combo",
    codeKey: "vehGrpCd",
  },
  {
    headerName: "LBL_VEH_DISPATCH_TP",
    field: "VEH_DISPATCH_TP",
    type: "combo",
    codeKey: "vehDspchTp",
  },
  { headerName: "LBL_RFID", field: "RFID", type: "text" },
  { headerName: "LBL_UDF1", field: "UDF1", type: "text" },
  {
    headerName: "LBL_UDF2",
    field: "UDF2",
    type: "text",
  },
  {
    headerName: "LBL_LIVESTOCK_VEHICLE_NO",
    field: "LIVESTOCK_VEHICLE_NO",
    type: "text",
  },
  {
    headerName: "LBL_SIGNATURE_YN",
    field: "SIGNATURE_YN",
    type: "check",
  },
  {
    headerName: "LBL_SEAL_YN",
    field: "SEAL_YN",
    type: "check",
  },
  {
    headerName: "LBL_LMO_YN",
    field: "LMO_YN",
    type: "check",
    checkEditable: false,
  },
];
