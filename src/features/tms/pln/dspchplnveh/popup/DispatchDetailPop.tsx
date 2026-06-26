"use client";

// 배차상세정보 팝업 — 배차상세정보.JPG 레이아웃.
//  상단: 조회조건 카드(차량번호/운전자명/차량유형명) — 표준 PopupSearchCondition
//  본문: 좌(배차정보+배송경로) / 우(할당·미할당 주문 탭 + 품목) — SplitPane 으로 분할 조정
//  툴바: 표준 DataGrid actions(GridActionsBar) — 라벨 키는 Sencha DispatchDetailPop 기준
//  데이터: 배차행 선택 → 배송경로/할당주문(+첫행 품목) 조회. 미할당주문은 배송유형 조건 조회(+첫행 품목).

import { useEffect, useState } from "react";
import DataGrid from "@/app/components/grid/DataGrid";
import { PopupSearchCondition } from "@/app/components/popup/PopupSearchCondition";
import { InlineSearchCondition } from "@/app/components/Search/InlineSearchCondition";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { ActionItem } from "@/app/components/ui/GridActionsBar";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { useCommonStores } from "@/hooks/useCommonStores";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { usePopup } from "@/app/components/popup/PopupContext";
import ConfirmModal from "@/app/components/popup/ConfirmPopup";
import DispatchMemoPopup from "@/app/components/popup/DispatchMemoPopup";
import PredictEstimateTimetoArrivalPop from "../../dispatchPlan/popup/PredictEstimateTimetoArrivalPop";
import { Lang } from "@/app/services/common/Lang";
import { dispatchPlanVehApi as api } from "../DispatchPlanVehApi";
import { MENU_CODE } from "../DispatchPlanVeh";

type Props = {
  onClose: () => void;
  /** 더블클릭한 행의 배차번호 — 고정차량은 첫 회전 배차키, 용차는 DSPCH_NO. */
  initValue?: Record<string, string>;
  /** 임시용차(계약차)에서 열렸는지 — true 면 배차생성/저장 버튼 숨김(센차 cntrVeh). */
  cntrVeh?: boolean;
};

// API 응답 rows 추출 (dsOut / result 양쪽 지원)
const rowsOf = (res: any) => res?.data?.data?.dsOut ?? res?.data?.result ?? [];

// 저장(dsSave)용 행에 EDIT_STS:"U" 부여 (센차 rowStatus='U' 대응)
const markU = (rows: any[]) => rows.map((r) => ({ ...r, EDIT_STS: "U" }));

// ── 배차정보 컬럼 (센차 DispatchDetailPopDspchGrid 기준, headerName=LBL 키) ──
const DSPCH_INFO_COLS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_BATCH",
    field: "BATCH_NO",
    align: "right",
    width: 40,
    hide: true,
  },
  {
    type: "numeric",
    headerName: "LBL_ROTATION",
    field: "RTN_NO",
    align: "right",
    width: 40,
  },
  {
    type: "combo",
    headerName: "LBL_OP_STATUS",
    field: "DSPCH_OP_STS",
    codeKey: "dspchOpSts",
    align: "center",
    width: 80,
  },
  {
    type: "text",
    headerName: "LBL_TO_ADDRESS",
    field: "LOC_NM",
    align: "left",
    width: 120,
  },
  {
    type: "text",
    headerName: "LBL_ITEM_UOM",
    field: "QTY",
    align: "left",
    width: 120,
  },
  {
    type: "numeric",
    headerName: "LBL_LOADING_RATE",
    field: "PLN_LD_RT",
    align: "right",
    width: 80,
    decimalPlaces: 1,
    summable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_PLN_GRS_VOL_RT",
    field: "PLN_GRS_VOL_RT",
    align: "right",
    width: 80,
    decimalPlaces: 1,
    summable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_PLN_GRS_WGT_RT",
    field: "PLN_GRS_WGT_RT",
    align: "right",
  },
  {
    type: "numeric",
    headerName: "LBL_PLN_PLT_QTY_RT",
    field: "PLN_PLT_RT",
    align: "right",
  },
  {
    type: "numeric",
    headerName: "LBL_PLN_RTNR_QTY_RT",
    field: "PLN_RTNR_RT",
    align: "right",
  },
  {
    type: "numeric",
    headerName: "LBL_PLN_PBOX_QTY_RT",
    field: "PLN_PBOX_RT",
    align: "right",
  },
  {
    type: "numeric",
    headerName: "LBL_PLN_BOX_QTY_RT",
    field: "PLN_BOX_RT",
    align: "right",
  },
  {
    type: "numeric",
    headerName: "LBL_PLN_FLEX_QTY1_RT",
    field: "PLN_FLEX_QTY1_RT",
    align: "right",
    width: 80,
    decimalPlaces: 1,
    summable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_PLN_FLEX_QTY2_RT",
    field: "PLN_FLEX_QTY2_RT",
    align: "right",
    width: 80,
    decimalPlaces: 1,
    summable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_PLN_FLEX_QTY3_RT",
    field: "PLN_FLEX_QTY3_RT",
    align: "right",
    width: 80,
    decimalPlaces: 1,
    summable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_PLN_FLEX_QTY4_RT",
    field: "PLN_FLEX_QTY4_RT",
    align: "right",
    width: 80,
    decimalPlaces: 1,
    summable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_PLN_FLEX_QTY5_RT",
    field: "PLN_FLEX_QTY5_RT",
    align: "right",
    width: 80,
    decimalPlaces: 1,
    summable: true,
  },
  {
    type: "text",
    headerName: "LBL_TRIP_NO",
    field: "TRIP_ID",
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_DISPATCH_NO",
    field: "DSPCH_NO",
    align: "center",
  },
  {
    type: "check",
    headerName: "LBL_CONST_OVRD_YN",
    field: "CONSTRAINT_OVRD_YN",
    align: "center",
    width: 80,
  },
  {
    type: "combo",
    headerName: "LBL_CONST_OVRD_RSN_CD",
    field: "CONSTRAINT_OVRD_RSN_CD",
    codeKey: "constraintOvrdCd",
    align: "left",
    width: 100,
  },
  {
    type: "numeric",
    headerName: "LBL_TRIP_COUNT",
    field: "RTN_NO",
    colId: "RTN_NO_TRIP_COUNT",
    align: "center",
    width: 80,
  },
  {
    type: "text",
    headerName: "LBL_INSERT_PERSON_ID",
    field: "CRE_USR_ID",
    align: "center",
    width: 150,
  },
  {
    type: "text",
    headerName: "LBL_INSERT_DATE",
    field: "CRE_DTTM",
    align: "center",
    width: 150,
  },
  {
    type: "text",
    headerName: "LBL_UPDATE_PERSON_ID",
    field: "UPD_USR_ID",
    align: "center",
    width: 150,
  },
  {
    type: "text",
    headerName: "LBL_UPDATE_TIME",
    field: "UPD_DTTM",
    align: "center",
    width: 150,
  },
  {
    type: "text",
    headerName: "VEH_OP_TP",
    noLang: true,
    field: "VEH_OP_TP",
    hide: true,
  },
];

// ── 배송경로 컬럼 (센차 DispatchDetailPopRouteGrid 기준, headerName=LBL 키) ──
const ROUTE_COLS = [
  {
    type: "text",
    headerName: "TTL_FI_DIST",
    noLang: true,
    field: "TTL_FI_DIST",
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_DISPATCH_PLAN_TYPE",
    field: "DSPCH_TP",
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_DISPATCH_NO",
    field: "DSPCH_NO",
    align: "right",
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_PLAN_ID",
    field: "PLN_ID",
    align: "right",
    hide: true,
  },
  {
    type: "numeric",
    headerName: "LBL_STOP_SEQUENCE",
    field: "STOP_SEQ",
    align: "right",
    width: 60,
  },
  {
    type: "text",
    headerName: "LBL_LOCATION_CODE",
    field: "LOC_CD",
    align: "center",
    width: 200,
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_LOCATION_NAME",
    field: "LOC_NM",
    align: "left",
    width: 140,
  },
  {
    type: "combo",
    headerName: "LBL_PICKDROP_DIV",
    field: "STOP_TP",
    codeKey: "stopTp",
    align: "center",
    width: 60,
  },
  {
    type: "datetime",
    headerName: "LBL_ETA_DTTM",
    field: "ETA_DTTM",
    align: "center",
    width: 120,
  },
  {
    type: "datetime",
    headerName: "LBL_ATA_DTTM",
    field: "ATA_DTTM",
    align: "center",
    width: 120,
  },
  {
    type: "datetime",
    headerName: "LBL_ATD_DTTM",
    field: "ATD_DTTM",
    align: "center",
    width: 120,
  },
  {
    type: "datetime",
    headerName: "LBL_ATC_DTTM",
    field: "ATC_DTTM",
    align: "center",
    width: 120,
  },
  {
    type: "datetime",
    headerName: "LBL_ETD_DTTM",
    field: "ETD_DTTM",
    align: "center",
    width: 120,
  },
  {
    type: "numeric",
    headerName: "LBL_TRNST_PREVSTOP_DIST",
    field: "TRNST_PREVSTOP_DIST",
    align: "right",
    summable: true,
  },
];

// ── 주문(할당/미할당) 컬럼 (센차 DispatchDetailPopAssignedShpm 기준) ──
const ORDER_COLS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_BATCH_NO", field: "BATCH_NO", align: "center", width: 70, hide: true },
  { type: "text", headerName: "LBL_DEPARTURE_NAME", field: "FRM_LOC_NM", align: "left", width: 80 },
  { type: "text", headerName: "LBL_DESTINATION_NAME", field: "TO_LOC_NM", align: "left", width: 80 },
  { type: "combo", headerName: "LBL_ORDER_TYPE", field: "ORD_TP", codeKey: "ordTp", align: "center", width: 100 },
  { type: "combo", headerName: "LBL_TEMP_TCD", field: "CMDT_CD", codeKey: "cmdtTp", align: "center", width: 70 },
  { type: "numeric", headerName: "LBL_PLN_GRS_VOL", field: "PLN_GRS_VOL", align: "right", summable: true },
  { type: "numeric", headerName: "LBL_PLN_GRS_WGT", field: "PLN_GRS_WGT", align: "right", summable: true },
  { type: "text", headerName: "LBL_ORDER_NO", field: "ORD_NO", align: "center" },
  { type: "text", headerName: "LBL_CUSTOMER_ORDER_NO", field: "CUST_ORD_NO", align: "center" },
  { type: "text", headerName: "LBL_DESTINATION_CODE", field: "TO_LOC_CD", align: "center", width: 160 },
  { type: "text", headerName: "LBL_DESTINATION_COUNTRY_NAME", field: "TO_CTRY_NM", align: "left" },
  { type: "text", headerName: "LBL_DESTINATION_STATE", field: "TO_STT_NM", align: "left" },
  { type: "text", headerName: "LBL_DESTINATION_CITY", field: "TO_CTY_NM", align: "left" },
  { type: "text", headerName: "LBL_TO_DETAIL_ADDRESS_1", field: "TO_DTL_ADDR1", align: "left", width: 160 },
  { type: "text", headerName: "LBL_TO_DETAIL_ADDRESS_2", field: "TO_DTL_ADDR2", align: "left", width: 160 },
  { type: "text", headerName: "LBL_DESTINATION_ZIP_CODE", field: "TO_ZIP_CD", align: "center" },
  { type: "numeric", headerName: "LBL_PLN_PLT_QTY", field: "PLN_PLT_QTY", align: "right", width: 100, summable: true },
  { type: "numeric", headerName: "LBL_PLN_RTNR_QTY", field: "PLN_RTNR_QTY", align: "right", width: 100, summable: true },
  { type: "numeric", headerName: "LBL_PLN_PBOX_QTY", field: "PLN_PBOX_QTY", align: "right", width: 100, summable: true },
  { type: "numeric", headerName: "LBL_PLN_BOX_QTY", field: "PLN_BOX_QTY", align: "right", width: 100, summable: true },
  { type: "numeric", headerName: "LBL_PLANNED_FLEX_QTY1", field: "PLN_FLEX_QTY1", align: "right", width: 80, summable: true },
  { type: "numeric", headerName: "LBL_PLANNED_FLEX_QTY2", field: "PLN_FLEX_QTY2", align: "right", width: 90, summable: true },
  { type: "numeric", headerName: "LBL_PLANNED_FLEX_QTY3", field: "PLN_FLEX_QTY3", align: "right", width: 90, summable: true },
  { type: "numeric", headerName: "LBL_PLANNED_FLEX_QTY4", field: "PLN_FLEX_QTY4", align: "right", width: 90, summable: true },
  { type: "numeric", headerName: "LBL_PLANNED_FLEX_QTY5", field: "PLN_FLEX_QTY5", align: "right", width: 90, summable: true },
  { type: "numeric", headerName: "LBL_PLANNED_QTY", field: "PLN_QTY", align: "right", summable: true },
  { type: "text", headerName: "LBL_SHIPMENT_NUMBER", field: "SHPM_NO", align: "center" },
  { type: "text", headerName: "LBL_MIT_CODE_NAME", field: "MIT_CLSS_CD", align: "center" },
  { type: "text", headerName: "LBL_CUSTOMER_CODE", field: "CUST_CD", align: "center" },
  { type: "text", headerName: "LBL_CUSTOMER_NAME", field: "CUST_NM", align: "left" },
  { type: "text", headerName: "LBL_DEPARTURE_CODE", field: "FRM_LOC_CD", align: "center" },
  { type: "text", headerName: "LBL_DEPARTURE_COUNTRY_NAME", field: "FRM_CTRY_NM", align: "left" },
  { type: "text", headerName: "LBL_DEPARTURE_STATE", field: "FRM_STT_NM", align: "left" },
  { type: "text", headerName: "LBL_FROM_CITY_NM", field: "FRM_CTY_NM", align: "left" },
  { type: "text", headerName: "LBL_FRM_DETAIL_ADDRESS_1", field: "FRM_DTL_ADDR1", align: "left", width: 160 },
  { type: "text", headerName: "LBL_FRM_DETAIL_ADDRESS_2", field: "FRM_DTL_ADDR2", align: "left" },
  { type: "text", headerName: "LBL_DEPARTURE_ZIP_CODE", field: "FRM_ZIP_CD", align: "center" },
  { type: "text", headerName: "LBL_SHPM_RMRK", field: "SHPM_RSN_DESC", align: "left", width: 160 },
  { type: "text", headerName: "LBL_SOLD_TO_CD", field: "SOLD_TO_CD", align: "left", width: 160 },
  { type: "text", headerName: "LBL_SOLD_TO_NM", field: "SOLD_TO_NM", align: "left", width: 160 },
  { type: "text", headerName: "LBL_CUST_PICKUP_YN", field: "CUST_PICKUP_YN", align: "center", width: 100 },
];

// ── 할당주문 품목 컬럼 (센차 DispatchDetailPopAssignedShpmDtl 기준) ──
const ITEM_COLS = [
  { headerName: "No" },
  // hidden
  {
    type: "text",
    headerName: "ShipmentId",
    noLang: true,
    field: "SHPM_ID",
    align: "center",
    width: 100,
    hide: true,
  },
  {
    type: "text",
    headerName: "LGST_GRP_CD",
    noLang: true,
    field: "LGST_GRP_CD",
    align: "center",
    width: 100,
    hide: true,
  },
  {
    type: "text",
    headerName: "CustCd",
    noLang: true,
    field: "CUST_CD",
    align: "center",
    width: 100,
    hide: true,
  },
  {
    type: "text",
    headerName: "ShipmentDetailCd",
    noLang: true,
    field: "SHPM_DTL_ID",
    align: "center",
    width: 100,
    hide: true,
  },
  {
    type: "text",
    headerName: "OrderLineNumber",
    noLang: true,
    field: "ORD_LINE_NO",
    colId: "ORD_LINE_NO_HIDDEN",
    align: "center",
    width: 100,
    hide: true,
  },
  {
    type: "text",
    headerName: "ItemSystemCd",
    noLang: true,
    field: "ITEM_SYS_CD",
    align: "center",
    width: 100,
    hide: true,
  },
  {
    type: "text",
    headerName: "CmdtCd",
    noLang: true,
    field: "CMDT_CD",
    align: "center",
    width: 100,
    hide: true,
  },
  {
    type: "text",
    headerName: "CUST_ORD_NO",
    noLang: true,
    field: "CUST_ORD_NO",
    align: "center",
    width: 100,
    hide: true,
  },
  {
    type: "text",
    headerName: "SHPM_NO",
    noLang: true,
    field: "SHPM_NO",
    align: "center",
    width: 100,
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_SHIPMENT_SPLIT_ALW_YN",
    field: "ALLOW_SHIPMENT_SPLIT",
    align: "center",
    width: 150,
    hide: true,
  },
  // 품목라인
  {
    type: "text",
    headerName: "LBL_ORD_ITM_LINE_NO",
    field: "ORD_LINE_NO",
    align: "left",
    width: 100,
  },
  {
    type: "text",
    headerName: "LBL_ITEM_CD",
    field: "CUST_ITEM_CD",
    align: "center",
    width: 100,
  },
  {
    type: "text",
    headerName: "LBL_ITEM_NM",
    field: "CUST_ITEM_NM",
    align: "left",
    width: 100,
  },
  {
    type: "numeric",
    headerName: "LBL_PLN_ORD_QTY",
    field: "PLN_ORD_QTY",
    align: "right",
    width: 100,
  },
  {
    type: "combo",
    headerName: "LBL_PLN_ORD_QTY_UOM",
    field: "PLN_ORD_QTY_UOM",
    codeKey: "itmUom",
    align: "center",
    width: 100,
  },
  {
    type: "numeric",
    headerName: "LBL_PLN_INV_QTY",
    field: "PLN_INV_QTY",
    align: "right",
    width: 100,
  },
  {
    type: "combo",
    headerName: "LBL_PLN_INV_QTY_UOM",
    field: "PLN_INV_QTY_UOM",
    codeKey: "itmUom",
    align: "center",
    width: 100,
  },
  {
    type: "numeric",
    headerName: "LBL_PLN_NET_WGT",
    field: "PLN_NET_WGT",
    align: "right",
    width: 100,
    summable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_PLN_GRS_WGT",
    field: "PLN_GRS_WGT",
    align: "right",
    width: 100,
    summable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_PLN_PLT_QTY",
    field: "PLN_PLT_QTY",
    align: "right",
    width: 100,
    summable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_PLN_RTNR_QTY",
    field: "PLN_RTNR_QTY",
    align: "right",
    width: 100,
    summable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_PLN_PBOX_QTY",
    field: "PLN_PBOX_QTY",
    align: "right",
    width: 100,
    summable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_PLN_BOX_QTY",
    field: "PLN_BOX_QTY",
    align: "right",
    width: 100,
    summable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_PLANNED_FLEX_QTY1",
    field: "PLN_FLEX_QTY1",
    align: "right",
    width: 80,
    summable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_PLANNED_FLEX_QTY2",
    field: "PLN_FLEX_QTY2",
    align: "right",
    width: 90,
    summable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_PLANNED_FLEX_QTY3",
    field: "PLN_FLEX_QTY3",
    align: "right",
    width: 90,
    summable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_PLANNED_FLEX_QTY4",
    field: "PLN_FLEX_QTY4",
    align: "right",
    width: 90,
    summable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_PLANNED_FLEX_QTY5",
    field: "PLN_FLEX_QTY5",
    align: "right",
    width: 90,
    summable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_CFM_ORD_QTY",
    field: "CFM_ORD_QTY",
    align: "right",
    width: 100,
  },
  {
    type: "combo",
    headerName: "LBL_CFM_ORD_QTY_UOM",
    field: "CFM_ORD_QTY_UOM",
    codeKey: "itmUom",
    align: "left",
    width: 100,
  },
  {
    type: "numeric",
    headerName: "LBL_CFM_INV_QTY",
    field: "CFM_INV_QTY",
    align: "right",
    width: 100,
  },
  {
    type: "combo",
    headerName: "LBL_CFM_INV_QTY_UOM",
    field: "CFM_INV_QTY_UOM",
    codeKey: "itmUom",
    align: "left",
    width: 100,
  },
  {
    type: "numeric",
    headerName: "LBL_CFM_NET_WGT",
    field: "CFM_NET_WGT",
    align: "right",
    width: 100,
    summable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_CFM_GRS_WGT",
    field: "CFM_GRS_WGT",
    align: "right",
    width: 100,
    summable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_CFM_PLT_QTY",
    field: "CFM_PLT_QTY",
    align: "right",
    width: 100,
    summable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_CFM_RTNR_QTY",
    field: "CFM_RTNR_QTY",
    align: "right",
    width: 100,
    summable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_CFM_PBOX_QTY",
    field: "CFM_PBOX_QTY",
    align: "right",
    width: 100,
    summable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_CFM_BOX_QTY",
    field: "CFM_BOX_QTY",
    align: "right",
    width: 100,
    summable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_CONFIRMED_FLEX_QTY1",
    field: "CFM_FLEX_QTY1",
    align: "right",
    width: 80,
    summable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_CONFIRMED_FLEX_QTY2",
    field: "CFM_FLEX_QTY2",
    align: "right",
    width: 90,
    summable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_CONFIRMED_FLEX_QTY3",
    field: "CFM_FLEX_QTY3",
    align: "right",
    width: 90,
    summable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_CONFIRMED_FLEX_QTY4",
    field: "CFM_FLEX_QTY4",
    align: "right",
    width: 90,
    summable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_CONFIRMED_FLEX_QTY5",
    field: "CFM_FLEX_QTY5",
    align: "right",
    width: 90,
    summable: true,
  },
  {
    type: "text",
    headerName: "LBL_ITEM_REMARK",
    field: "SHPM_DTL_RSN_DESC",
    align: "left",
    width: 120,
  },
  {
    type: "text",
    headerName: "LBL_FEED_FCD",
    field: "ITEM_FCD",
    align: "left",
    width: 100,
  },
  {
    type: "text",
    headerName: "LBL_TEMPER_ZONE",
    field: "TEMP_TCD",
    align: "left",
    width: 80,
  },
  {
    type: "text",
    headerName: "LBL_INSERT_DATE",
    field: "CRE_DTTM",
    align: "center",
    width: 150,
  },
  {
    type: "text",
    headerName: "LBL_INSERT_PERSON_ID",
    field: "CRE_USR_ID",
    align: "center",
    width: 150,
  },
  {
    type: "text",
    headerName: "LBL_UPDATE_TIME",
    field: "UPD_DTTM",
    align: "center",
    width: 150,
  },
  {
    type: "text",
    headerName: "LBL_UPDATE_PERSON_ID",
    field: "UPD_USR_ID",
    align: "center",
    width: 150,
  },
];

// 주문 그리드 탭 — 할당/미할당
const ORDER_TABS = [
  { key: "ALLOC", label: "LBL_ASSIGNED_SHIPMENTS" },
  { key: "UNALLOC", label: "LBL_UNASSIGNED_SHIPMENTS" },
];

export default function DispatchDetailPop({
  onClose,
  initValue,
  cntrVeh = false,
}: Props) {
  const [vehNo, setVehNo] = useState(initValue.VEH_NO);
  const [drvrNm, setDrvrNm] = useState(initValue.DRVR_NM);
  const [vehTpCd, setVehTpCd] = useState(initValue.VEH_TP_CD);

  const [dspchRowData, setDspchRowData] = useState<any[]>([]);
  const [routeRowData, setRouteRowData] = useState<any[]>([]);
  const [assignShpmRow, setAssignShpmRow] = useState<any[]>([]);
  const [assignItemRow, setAssignItemRow] = useState<any[]>([]);
  const [unAssignShpmRow, setUnAssignShpmRow] = useState<any[]>([]);
  const [unAssignItemRow, setUnAssignItemRow] = useState<any[]>([]);
  const [unAssignSearching, setUnAssignSearching] = useState(false);

  // 미할당주문 조회조건 — 배송유형만
  const [unallocCond, setUnallocCond] = useState<Record<string, string>>({
    DLVRY_TP: "ALL",
  });
  const [unallocCondOpen, setUnallocCondOpen] = useState(true);

  const { stores, codeMap } = useCommonStores({
    vehTpCd: { sqlProp: "selectVehTpList" },
    dspchOpSts: { sqlProp: "CODE", keyParam: "DSPCH_OP_STS" },
    dlvryTpList: { sqlProp: "CODE", keyParam: "HARIM_ORD_DLV_TP_CD" },
    constraintOvrdCd: { sqlProp: "CODE", keyParam: "CONSTRAINT_OVRD_CD" },
    stopTp: { sqlProp: "CODE", keyParam: "STOP_TP" },
    itmUom: { sqlProp: "CODE", keyParam: "ITEM_UOM" },
  });

  const { menuName } = useMenuMeta();
  const showError = useErrorAlert();
  const { openPopup, closePopup } = usePopup();
  const [selDspch, setSelDspch] = useState<any>(null); // 선택된 배차행

  // 그리드별 마스킹(작업 차단 오버레이) — 처리 중 ON, settle 시 자동 OFF.
  // base.callAjax({ mask }) 와 동일 효과 (DataGrid loading prop).
  const [dspchMasking, setDspchMasking] = useState(false);
  const [routeMasking, setRouteMasking] = useState(false);
  const [allocMasking, setAllocMasking] = useState(false);
  const [unallocMasking, setUnallocMasking] = useState(false);
  const runMask = <T,>(setMask: (b: boolean) => void, p: Promise<T>) => {
    setMask(true);
    return p.finally(() => setMask(false));
  };

  // 확인 다이얼로그 (base.confirm 동일 패턴) — "확인" 시 onYes 실행
  const confirmMsg = (msg: string, onYes: () => void, title = "확인") => {
    openPopup({
      type: "confirm",
      width: "lg",
      content: (
        <ConfirmModal
          title={title}
          description={msg}
          type="confirm"
          onClose={() => {
            closePopup();
            onYes();
          }}
        />
      ),
    });
  };

  // 할당주문 행의 품목 조회 (SHPM_ID 기준)
  const loadAssignItems = (row: any) => {
    if (!row?.SHPM_ID) {
      setAssignItemRow([]);
      return;
    }
    api
      .searchAssignedShipmentDetail({ SHPM_ID: row.SHPM_ID })
      .then((res) => setAssignItemRow(rowsOf(res)));
  };

  // 미할당주문 행의 품목 조회 (SHPM_ID 기준)
  const loadUnAssignItems = (row: any) => {
    if (!row?.SHPM_ID) {
      setUnAssignItemRow([]);
      return;
    }
    api
      .searchUnAssignedShipmentDetail({ SHPM_ID: row.SHPM_ID })
      .then((res) => setUnAssignItemRow(rowsOf(res)));
  };

  const subParams = (record: any) => ({
    DSPCH_NO: record.DSPCH_NO,
    TRIP_ID: record.TRIP_ID,
    PLN_ID: record.PLN_ID,
    TTL_FI_DIST: record.TTL_FI_DIST,
  });

  // 배송경로(경유지) 조회 — 처리 중 배송경로 그리드 마스킹
  const loadRoute = (record: any) => {
    if (!record) {
      setRouteRowData([]);
      return Promise.resolve();
    }
    return runMask(setRouteMasking, api.searchPlanStop(subParams(record))).then(
      (res) => setRouteRowData(rowsOf(res)),
    );
  };

  // 할당주문 조회 (첫 행 품목까지) — 처리 중 할당주문 그리드 마스킹
  const loadAssigned = (record: any) => {
    if (!record) {
      setAssignShpmRow([]);
      setAssignItemRow([]);
      return Promise.resolve();
    }
    return runMask(
      setAllocMasking,
      api.searchAssignedShipment(subParams(record)),
    ).then((res) => {
      const rows = rowsOf(res);
      setAssignShpmRow(rows);
      loadAssignItems(rows[0]);
    });
  };

  // 배차행 선택 → 배송경로 + 할당주문 동시 재조회 (record 없으면 서브 비움)
  const loadSub = (record: any) => {
    setSelDspch(record ?? null);
    return Promise.all([loadRoute(record), loadAssigned(record)]);
  };

  // 미할당주문 조회 (배송유형 조건) → 첫 행 품목까지
  const handleUnallocOrderSearch = () => {
    setUnAssignSearching(true);
    api
      .getUnallocOrderList({
        DIV_CD: initValue.DIV_CD,
        LGST_GRP_CD: initValue.LGST_GRP_CD,
        PLN_ID: initValue.PLN_ID,
        DLVRY_DT: initValue.DLVRY_DT,
        DLVRY_TP: unallocCond.DLVRY_TP === "ALL" ? "" : unallocCond.DLVRY_TP,
      })
      .then((res) => {
        const rows = rowsOf(res);
        setUnAssignShpmRow(rows);
        loadUnAssignItems(rows[0]);
      })
      .finally(() => setUnAssignSearching(false));
  };

  // 주문할당 — 선택 미할당주문 행을 선택 배차행(DSPCH_NO)에 할당 → 미할당/할당 재조회
  const onAssignShipment = (e: any) => {
    const rows = (e?.data ?? []) as any[];
    if (!selDspch?.DSPCH_NO) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    if (!rows.length) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    runMask(
      setUnallocMasking,
      api.saveAssignedShipment(
        rows.map((r) => ({ ...r, DSPCH_NO: selDspch.DSPCH_NO })),
      ),
    ).then(() => {
      handleUnallocOrderSearch();
      loadSub(selDspch);
    });
  };

  // 주문할당취소 — 선택 할당주문 행을 미할당으로 → 할당/배송경로/미할당 재조회
  const onUnassignedShipment = (e: any) => {
    const rows = (e?.data ?? []) as any[];
    if (!rows.length) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    runMask(setAllocMasking, api.saveUnAssignedShipment(rows)).then(() => {
      loadSub(selDspch);
      handleUnallocOrderSearch();
    });
  };

  // 할당주문 그리드 액션 — 주문할당취소 (dispatchPlan 할당주문 탭 동일 기능)
  const allocActions: ActionItem[] = [
    {
      type: "button",
      key: "BTN_UNASSIGNED_SHIPMENT",
      label: "BTN_UNASSIGNED_SHIPMENT",
      onClick: onUnassignedShipment,
    },
  ];

  // 미할당주문 그리드 액션 — 주문할당 + 엑셀(dispatchPlan 미할당탭 동일 기능)
  const unallocActions: ActionItem[] = [
    {
      type: "button",
      key: "BTN_ASSIGN_SHIPMENT",
      label: "BTN_ASSIGN_SHIPMENT",
      onClick: onAssignShipment,
    },
    makeExcelGroupAction({
      excelColumns: () => ORDER_COLS,
      menuCode: MENU_CODE,
      menuName,
      fetchFn: () =>
        api.getUnallocOrderList({
          DIV_CD: initValue.DIV_CD,
          LGST_GRP_CD: initValue.LGST_GRP_CD,
          PLN_ID: initValue.PLN_ID,
          DLVRY_DT: initValue.DLVRY_DT,
          DLVRY_TP:
            unallocCond.DLVRY_TP === "ALL" ? "" : unallocCond.DLVRY_TP,
        }),
      rows: unAssignShpmRow,
    }),
  ];

  // 배차목록 재조회 → 첫 배차행 기준 하위(할당주문/배송경로) 자동 재조회 (저장/처리 후 호출)
  const refreshDspch = () =>
    api
      .searchDispatchPop({
        DSPCH_NO: initValue.DSPCH_NO,
        VEH_ID: initValue.VEH_ID,
        DLVRY_DT: initValue.DLVRY_DT,
        DIV_CD: initValue.DIV_CD,
        LGST_GRP_CD: initValue.LGST_GRP_CD,
        PLN_ID: initValue.PLN_ID,
      })
      .then((res) => {
        const rows = rowsOf(res);
        setDspchRowData(rows);
        return loadSub(rows[0]);
      });

  // ── 배차목록 액션 (dspchplnveh dedActions 동일 기능, 팝업 행=DSPCH_NO 보유) ──
  // 배차취소(자차)
  const onCancelDspch = (e: any) => {
    const rows = (e?.data ?? []) as any[];
    if (!rows.length) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    confirmMsg(Lang.get("MSG_CANCEL_DSPCH_OPEN_STATUS"), () => {
      runMask(
        setDspchMasking,
        api.saveCancelPlanDedDispatch(markU(rows)).then(refreshDspch),
      );
    });
  };
  // 계획확정
  const onSetPlanned = (e: any) => {
    const rows = (e?.data ?? []) as any[];
    if (!rows.length) {
      showError(Lang.get("MSG_EXCEPTION_DISPATCH_SET_TO_PLAN_SELECT"));
      return;
    }
    confirmMsg(Lang.get("MSG_CONFIRM_DSPCH_OPEN_ONLY"), () => {
      runMask(
        setDspchMasking,
        api.savePlannedPlanDispatch(markU(rows)).then(refreshDspch),
      );
    });
  };
  // 계획확정취소
  const onReturnOpen = (e: any) => {
    const rows = (e?.data ?? []) as any[];
    if (!rows.length) {
      showError(Lang.get("MSG_EXCEPTION_DISPATCH_RTN_TO_OPEN_SELECT"));
      return;
    }
    runMask(
      setDspchMasking,
      api.saveCancelPlannedPlanDispatch(markU(rows)).then(refreshDspch),
    );
  };
  // 메모 등록 (단건)
  const onMemoReg = (e: any) => {
    const rows = (e?.data ?? []) as any[];
    if (!rows.length) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    if (rows.length > 1) {
      showError(Lang.get("MSG_CHECK_SINGLE_RECORD"));
      return;
    }
    const row = rows[0];
    if (!row?.DSPCH_NO) {
      showError("배차가 없어 메모를 등록할 수 없습니다.");
      return;
    }
    openPopup({
      title: "LBL_MEMO",
      width: "4xl",
      content: (
        <DispatchMemoPopup
          row={row}
          statusLabel={
            codeMap.dspchOpSts?.[row.DSPCH_OP_STS] ??
            String(row.DSPCH_OP_STS ?? "")
          }
          fetchMemo={(dspchNo) => api.searchDispatchMemo({ DSPCH_NO: dspchNo })}
          saveMemo={(record) => api.saveDispatchMemo(record)}
          onSaved={() => {
            closePopup();
            refreshDspch();
          }}
          onClose={closePopup}
        />
      ),
    });
  };
  // 메모 취소 (단건)
  const onMemoCancel = (e: any) => {
    const rows = (e?.data ?? []) as any[];
    if (!rows.length) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    if (rows.length > 1) {
      showError(Lang.get("MSG_CHECK_SINGLE_RECORD"));
      return;
    }
    confirmMsg("메모를 취소하시겠습니까?", () => {
      runMask(
        setDspchMasking,
        api.cancelDspchMemo(rows).then(refreshDspch),
      );
    });
  };
  // 경유순서 자동조정 (단건) — saveAutoChangeStopSeq
  const onAutoChangeStopSeq = (e: any) => {
    const rows = (e?.data ?? []) as any[];
    if (!rows.length) {
      showError(Lang.get("MSG_EXCEPTION_STOP_RESEQUENCE_DISPATCH_SELECT"));
      return;
    }
    if (rows.length > 1) {
      showError(Lang.get("MSG_STOP_RE_SEQ_DISPATCH_CHK"));
      return;
    }
    runMask(
      setDspchMasking,
      api
        .saveAutoChangeStopSeq(rows.map((r) => ({ ...r, rowStatus: "U" })))
        .then(refreshDspch),
    );
  };

  // 배차목록 그리드 액션 — dedActions 와 라벨 동일 버튼은 동일 기능 연결.
  // (LBL_CREATE_NEW_DSPCH / BTN_SAVE 는 dedActions 미해당 → 미연동)
  // 임시용차(cntrVeh)면 배차생성(BTN_MANAGE_DSPCH)·저장(BTN_SAVE) 숨김
  //  → 메모 / 계획확정 / 경유순서자동조정 3개만 노출 (센차 cntrVeh 동일).
  const dspchActions: ActionItem[] = [
    ...(cntrVeh
      ? []
      : ([
          {
            type: "group",
            key: "BTN_MANAGE_DSPCH",
            label: "BTN_MANAGE_DSPCH",
            items: [
              {
                type: "button",
                key: "LBL_CREATE_NEW_DSPCH",
                label: "LBL_CREATE_NEW_DSPCH",
              },
              {
                type: "button",
                key: "BTN_DISPATCH_CANCEL",
                label: "BTN_DISPATCH_CANCEL",
                onClick: onCancelDspch,
              },
            ],
          },
        ] as ActionItem[])),
    {
      type: "group",
      key: "LBL_MEMO",
      label: "LBL_MEMO",
      items: [
        {
          type: "button",
          key: "BTN_REGISTRATION",
          label: "BTN_REGISTRATION",
          onClick: onMemoReg,
        },
        {
          type: "button",
          key: "BTN_CANCEL",
          label: "BTN_CANCEL",
          onClick: onMemoCancel,
        },
      ],
    },
    {
      type: "group",
      key: "BTN_SET_TO_PLANNED",
      label: "BTN_SET_TO_PLANNED",
      items: [
        {
          type: "button",
          key: "BTN_SET_TO_PLANNED",
          label: "BTN_SET_TO_PLANNED",
          onClick: onSetPlanned,
        },
        {
          type: "button",
          key: "BTN_RETURN_TO_OPEN",
          label: "BTN_RETURN_TO_OPEN",
          onClick: onReturnOpen,
        },
      ],
    },
    ...(cntrVeh
      ? []
      : ([
          { type: "button", key: "BTN_SAVE", label: "BTN_SAVE" },
        ] as ActionItem[])),
    {
      type: "button",
      key: "BTN_STOP_RESEQUENCE",
      label: "BTN_STOP_RESEQUENCE",
      onClick: onAutoChangeStopSeq,
    },
  ];

  // ── 배송경로 액션 (dispatchPlan stopActions 동일 기능) ──
  // 선택 배차행(selDspch) + 배송경로 행(routeRowData) 기준
  const validatorPredictEta = (row: any) => {
    if (!row?.DSPCH_NO) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return false;
    }
    if (row.DSPCH_OP_STS >= "2090") {
      showError(Lang.get("MSG_PRIDICT_ETA_EXCEPTION_WHEN_IN_TRANSIT"));
      return false;
    }
    if (row.DSPCH_OP_STS >= "2110") {
      showError(Lang.get("MSG_PRIDICT_ETA_EXCEPTION_WHEN_DELIVERED"));
      return false;
    }
    return true;
  };
  const validatorCalcEta = (row: any) => {
    if (!row?.DSPCH_NO) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return false;
    }
    if (row.DSPCH_OP_STS < "2090") {
      showError(
        Lang.get("MSG_CAL_ETA_EXCEPTION_BEFORE_TRANSIT_PARTIALLY_DELIVERED"),
      );
      return false;
    }
    if (row.DSPCH_OP_STS == "2110") {
      showError(Lang.get("MSG_CAL_ETA_EXCEPTION_DELIVERED"));
      return false;
    }
    if (row.DSPCH_OP_STS == "2090" || row.DSPCH_OP_STS == "2100") {
      const blocked = routeRowData.find(
        (d) => d.ATA_DTTM != null && d.ATD_DTTM == null,
      );
      if (blocked) {
        showError(
          Lang.get("MSG_CAL_ETA_EXCEPTION_IN_TRANSIT", [
            row.VEH_NO,
            blocked.LOC_NM,
          ]),
        );
        return false;
      }
    }
    return true;
  };

  // ETA 예측 — 운송시작일 입력 팝업 → predictEta → 배송경로 재조회
  const onPredictEta = () => {
    if (!validatorPredictEta(selDspch)) return;
    openPopup({
      title: "BTN_PREDICT_ETA",
      width: "sm",
      content: (
        <PredictEstimateTimetoArrivalPop
          onConfirm={(data) => {
            closePopup();
            runMask(
              setRouteMasking,
              api.predictEta({
                ATD_DTTM: data.TRNS_STDT_DATE,
                DSPCH_NO: selDspch.DSPCH_NO,
                TRIP_ID: selDspch.TRIP_ID,
                TRIP_SEQ: selDspch.TRIP_SEQ,
                DIV_CD: initValue.DIV_CD,
                LGST_GRP_CD: initValue.LGST_GRP_CD,
              }),
            ).then(() => loadRoute(selDspch));
          }}
          onClose={closePopup}
        />
      ),
    });
  };
  // ETA 계산 → 배송경로 재조회
  const onCalcEta = () => {
    if (!validatorCalcEta(selDspch)) return;
    runMask(setRouteMasking, api.calcEta({ DSPCH_NO: selDspch.DSPCH_NO })).then(
      () => loadRoute(selDspch),
    );
  };
  // 경유순서 저장
  const onSaveStopOrder = () => {
    if (!selDspch?.DSPCH_NO) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    runMask(
      setRouteMasking,
      api.saveStopOrder({ DSPCH_NO: selDspch.DSPCH_NO, stops: routeRowData }),
    ).then(() => loadRoute(selDspch));
  };

  // 배송경로 그리드 액션 — stopActions 와 라벨 동일 버튼은 동일 기능 연결.
  // (BTN_SPLIT_STOP / 조정±(SEQ_PLUS·MINUS) 는 원본도 빈 스텁 → 미연동 유지)
  const routeActions: ActionItem[] = [
    {
      type: "button",
      key: "BTN_PREDICT_ETA",
      label: "BTN_PREDICT_ETA",
      onClick: onPredictEta,
    },
    {
      type: "button",
      key: "BTN_CALCULATE_ETA",
      label: "BTN_CALCULATE_ETA",
      onClick: onCalcEta,
    },
    { type: "button", key: "BTN_SPLIT_STOP", label: "BTN_SPLIT_STOP" },
    {
      type: "button",
      key: "BTN_ADJUST_STOP_SEQ_PLUS",
      label: "BTN_ADJUST_STOP_SEQ_PLUS",
    },
    {
      type: "button",
      key: "BTN_ADJUST_STOP_SEQ_MINUS",
      label: "BTN_ADJUST_STOP_SEQ_MINUS",
    },
    {
      type: "button",
      key: "BTN_ADJUST_STOP_SEQ",
      label: "BTN_ADJUST_STOP_SEQ",
      onClick: onSaveStopOrder,
    },
  ];

  // 진입 시 배차목록 조회
  useEffect(() => {
    refreshDspch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initValue]);

  return (
    <div className="flex flex-col gap-2 w-full" style={{ height: "74vh" }}>
      {/* 상단 조회조건 — 표준 카드형 (PopupSearchCondition) */}
      <PopupSearchCondition
        columns={4}
        fields={[
          {
            label: "LBL_VEH_NO",
            type: "text",
            value: vehNo,
            onChange: setVehNo,
            disable: true,
          },
          {
            label: "LBL_DRIVER_NAME",
            type: "text",
            value: drvrNm,
            onChange: setDrvrNm,
            disable: true,
          },
          {
            label: "LBL_VEHICLE_TYPE_NAME",
            type: "combo",
            value: vehTpCd,
            onChange: setVehTpCd,
            options: stores.vehTpCd,
            disable: true,
          },
        ]}
      />

      {/* 본문 2단 — SplitPane 으로 좌/우 분할 조정 */}
      <div className="flex-1 min-h-0">
        <SplitPane
          direction="horizontal"
          defaultSizes={[60, 40]}
          minSizes={[30, 25]}
          storageKey="DSPCH_DETAIL_POP_SPLIT"
        >
          {/* 좌: 배차정보 + 배송경로 — 세로 분할(서로 크기 조정) */}
          <div className="h-full min-h-0">
            <SplitPane
              direction="vertical"
              defaultSizes={[50, 50]}
              storageKey="DSPCH_DETAIL_POP_LEFT_SPLIT"
            >
              <DataGrid
                layoutType="plain"
                subTitle="LBL_DISPATCH_LIST"
                actions={dspchActions}
                columnDefs={DSPCH_INFO_COLS}
                rowData={dspchRowData}
                setRowData={setDspchRowData}
                codeMap={codeMap}
                rowSelection="single"
                onRowClicked={loadSub}
                loading={dspchMasking}
                audit={false}
              />
              <DataGrid
                layoutType="plain"
                subTitle="LBL_TRANSPORTATION_ROUTE"
                actions={routeActions}
                columnDefs={ROUTE_COLS}
                codeMap={codeMap}
                rowData={routeRowData}
                setRowData={setRouteRowData}
                loading={routeMasking}
                audit={false}
              />
            </SplitPane>
          </div>

          {/* 우: 주문(할당/미할당) 탭 — 각 탭 = 주문 그리드 + 품목 그리드(세로 분할) */}
          <div className="h-full flex flex-col gap-2 min-h-0">
            <DataGrid
              layoutType="tab"
              tabs={ORDER_TABS}
              presets={{
                // 할당주문 — 조회조건 없음
                ALLOC: {
                  render: () => (
                    <SplitPane direction="vertical" defaultSizes={[60, 40]}>
                      <DataGrid
                        layoutType="plain"
                        subTitle="LBL_ASSIGNED_SHIPMENTS"
                        actions={allocActions}
                        columnDefs={ORDER_COLS}
                        codeMap={codeMap}
                        rowData={assignShpmRow}
                        setRowData={setAssignShpmRow}
                        rowSelection="multiple"
                        onRowClicked={loadAssignItems}
                        loading={allocMasking}
                        audit={false}
                      />
                      <DataGrid
                        layoutType="plain"
                        subTitle="LBL_ITEM_INFO"
                        actions={[]}
                        codeMap={codeMap}
                        columnDefs={ITEM_COLS}
                        rowData={assignItemRow}
                        audit={false}
                      />
                    </SplitPane>
                  ),
                },
                // 미할당주문 — 배송유형 조회조건만
                UNALLOC: {
                  render: () => (
                    <div className="flex flex-col h-full min-h-0 gap-2">
                      <InlineSearchCondition
                        open={unallocCondOpen}
                        onOpenChange={setUnallocCondOpen}
                        onSearch={handleUnallocOrderSearch}
                        searchBtnDisable={unAssignSearching}
                        fields={[
                          {
                            type: "combo",
                            label: "LBL_DLVRY_TP",
                            value: unallocCond.DLVRY_TP ?? "",
                            onChange: (v) =>
                              setUnallocCond((c) => ({ ...c, DLVRY_TP: v })),
                            options: stores.dlvryTpList
                              ? [
                                  { CODE: "ALL", NAME: "-" },
                                  ...stores.dlvryTpList,
                                ]
                              : [],
                          },
                        ]}
                      />
                      <div className="flex-1 min-h-0">
                        <SplitPane direction="vertical" defaultSizes={[60, 40]}>
                          <DataGrid
                            layoutType="plain"
                            subTitle="LBL_UNASSIGNED_SHIPMENTS"
                            actions={unallocActions}
                            columnDefs={ORDER_COLS}
                            codeMap={codeMap}
                            rowData={unAssignShpmRow}
                            setRowData={setUnAssignShpmRow}
                            rowSelection="multiple"
                            onRowClicked={loadUnAssignItems}
                            loading={unallocMasking}
                            audit={false}
                          />
                          <DataGrid
                            layoutType="plain"
                            subTitle="LBL_ITEM_INFO"
                            actions={[]}
                            columnDefs={ITEM_COLS}
                            codeMap={codeMap}
                            rowData={unAssignItemRow}
                            setRowData={setUnAssignItemRow}
                            audit={false}
                          />
                        </SplitPane>
                      </div>
                    </div>
                  ),
                },
              }}
              audit={false}
            />
          </div>
        </SplitPane>
      </div>
    </div>
  );
}
