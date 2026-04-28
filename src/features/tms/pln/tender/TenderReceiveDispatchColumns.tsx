// src/views/tender/TenderReceiveDispatchColumns.ts
// ──────────────────────────────────────────────────────────────────
//  센차 그리드 컬럼 정의 모음
//
//  [Sencha 파일 → React 함수 매핑]
//  TenderReceiveDispatchMain.js    → MAIN_COLUMN_DEFS(codeMap)
//  TenderReceiveDispatchSub01.js   → STOP_COLUMN_DEFS
//  TenderReceiveDispatchSub04.js   → SMS_COLUMN_DEFS
//  TenderReceiveDispatchCarrRate.js→ AP_SETL_COLUMN_DEFS(setRowData)
//
//  센차에서는 columns 배열을 각 파일에 분산 정의했지만,
//  React 에서는 한 파일에서 함수/상수로 export 하여
//  View/Controller 에서 import 해서 사용합니다.
// ──────────────────────────────────────────────────────────────────
import { DISPATCH_STATUS_COLOR_MAP } from "./TenderReceiveDispatchModel";
import { isInserted } from "@/app/components/grid/gridCommon";

// ── 메인 그리드 컬럼 (센차: TenderReceiveDispatchMain columns) ────
// codeMap: 공통코드 → 명칭 변환용 (센차: bindStore + displayField)
export const MAIN_COLUMN_DEFS = (
  codeMap: Record<string, Record<string, string>>,
) => [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_FINANCIAL_STATUS",
    field: "AP_FI_STS",
    cellRenderer: (params: any) => {
      const code = params.value;
      const label = codeMap.apFiSts?.[String(code)] ?? code;
      const cls =
        DISPATCH_STATUS_COLOR_MAP[String(code)] ?? "bg-gray-100 text-gray-600";
      return (
        <span className={`px-2 py-0.5 rounded-lg text-xs ${cls}`}>{label}</span>
      );
    },
  },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP", field: "LGST_GRP_CD" },
  { type: "text", headerName: "LBL_REQUESTED_DELIVERY_DATE", field: "DLVRY_DT" },
  { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO" },
  {
    type: "text",
    headerName: "LBL_DISPATCH_OPERATIONAL_STATUS",
    field: "DSPCH_OP_STS",
    cellRenderer: (params: any) => {
      const code = params.value;
      const label = codeMap.dspchOpSts?.[String(code)] ?? code;
      const cls =
        DISPATCH_STATUS_COLOR_MAP[String(code)] ?? "bg-gray-100 text-gray-600";
      return (
        <span className={`px-2 py-0.5 rounded-lg text-xs ${cls}`}>{label}</span>
      );
    },
  },
  { type: "text", headerName: "LBL_CARRIER_NAME", field: "CARR_NM" },
  { type: "text", headerName: "LBL_VEHICLE_TYPE_NAME", field: "VEH_TP_NM" },
  { type: "text", headerName: "입차순서", field: "ETRNC_SEQ" },
  { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO" },
  { type: "text", headerName: "LBL_DRIVER_NAME", field: "DRVR_NM" },
  { type: "text", headerName: "LBL_DEPARTURE_NAME", field: "FRM_LOC_NM" },
  { headerName: "LBL_TRCK_NO", field: "TRCK_NO", type: "numeric" },
  { type: "text", headerName: "LBL_SEND_SMS_DTTM", field: "SMS_APP_INST_DTTM" },
  { type: "text", headerName: "LBL_SEND_NO", field: "SEND_NO" },
  { type: "text", headerName: "LBL_MEMO", field: "MEMO" },
  { headerName: "LBL_STOP_CNT", field: "STOP_CNT", type: "numeric" },
  { type: "text", headerName: "LBL_CARR_RATE_BKNG_ALLWD_YN", field: "CARR_BOOKING_YN" },
  {
    headerName: "LBL_REG_RATE",
    field: "RATE",
    type: "numeric",
    editable: (params: any) => isInserted(params.data),
    valueSetter: (params: any) => {
      params.data.RATE = params.newValue;
      return true;
    },
  },
  { headerName: "LBL_CONFIRM_COST", field: "CFM_COST", type: "numeric" },
  { type: "text", headerName: "LBL_DIVISION", field: "DIV_CD" },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP", field: "LGST_GRP_CD" },
  { type: "text", headerName: "LBL_DEPARTURE_CODE", field: "FRM_LOC_CD" },
  { type: "text", headerName: "LBL_TRIP_NO", field: "TRIP_ID" },
  { headerName: "LBL_TRIP_SEQ", field: "TRIP_SEQ", type: "numeric" },
  { type: "text", headerName: "LBL_VEHICLE_CODE", field: "VEH_ID" },
  { type: "text", headerName: "LBL_DRIVER_CODE", field: "DRVR_ID" },
  { headerName: "LBL_BATCH", field: "BATCH_NO", type: "numeric" },
  { type: "text", headerName: "LBL_REQUEST_DATETIME", field: "REQ_ETRNC_DTTM" },
  { type: "text", headerName: "LBL_EXPECTED_DATETIME", field: "EXPCT_ETRNC_DTTM" },
  { type: "text", headerName: "LBL_ETRNC_RSN_DESC", field: "DLYD_ETRNC_RSN_DESC" },
  { type: "text", headerName: "LBL_CHK_TON_TYPE", field: "CARR_CFM_VEH_TCD" },
  { type: "text", headerName: "LBL_INSERT_PERSON_ID", field: "CRE_USR_ID" },
  { type: "text", headerName: "LBL_INSERT_DATE", field: "CRE_DTTM" },
  { type: "text", headerName: "LBL_UPDATE_PERSON_ID", field: "UPD_USR_ID" },
  { type: "text", headerName: "LBL_UPDATE_TIME", field: "UPD_DTTM" },
];

// ── 경유처 서브그리드 컬럼 (센차: TenderReceiveDispatchSub01 columns) ──
export const STOP_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO" },
  { type: "text", headerName: "LBL_STOP_SEQUENCE", field: "STOP_SEQ" },
  { type: "text", headerName: "LBL_LOCATION_CODE", field: "LOC_CD" },
  { type: "text", headerName: "LBL_LOCATION_NAME", field: "LOC_NM" },
  { type: "text", headerName: "LBL_PICKDROP_DIV", field: "STOP_TP" },
  { type: "text", headerName: "LBL_STATE", field: "STT_NM" },
  { type: "text", headerName: "LBL_CITY", field: "CTY_NM" },
  { type: "text", headerName: "LBL_DETAIL_ADDRESS", field: "DTL_ADDR1" },
  { type: "text", headerName: "LBL_DETAIL_ADDRESS2", field: "DTL_ADDR2" },
  { type: "text", headerName: "위도", field: "LAT" },
  { type: "text", headerName: "경도", field: "LON" },
  { type: "text", headerName: "상차CBM", field: "LDNG_VOL" },
  { type: "text", headerName: "상차중량", field: "LDNG_WGT" },
  { type: "text", headerName: "상차FQ1", field: "LDNG_FLEX_QTY1" },
  { type: "text", headerName: "상차FQ2", field: "LDNG_FLEX_QTY2" },
  { type: "text", headerName: "상차FQ3", field: "LDNG_FLEX_QTY3" },
  { type: "text", headerName: "상차FQ4", field: "LDNG_FLEX_QTY4" },
  { type: "text", headerName: "상차FQ5", field: "LDNG_FLEX_QTY5" },
  { type: "text", headerName: "하차CBM", field: "UNLDNG_VOL" },
  { type: "text", headerName: "하차중량", field: "UNLDNG_WGT" },
  { type: "text", headerName: "하차FQ1", field: "UNLDNG_FLEX_QTY1" },
  { type: "text", headerName: "하차FQ2", field: "UNLDNG_FLEX_QTY2" },
  { type: "text", headerName: "하차FQ3", field: "UNLDNG_FLEX_QTY3" },
  { type: "text", headerName: "하차FQ4", field: "UNLDNG_FLEX_QTY4" },
  { type: "text", headerName: "하차FQ5", field: "UNLDNG_FLEX_QTY5" },
];

// ── SMS 전송이력 서브그리드 컬럼 (센차: TenderReceiveDispatchSub04 columns) ──
export const SMS_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_ORDER_NO", field: "ORD_NO" },
  { type: "text", headerName: "LBL_CUSTOMER_ORDER_NO", field: "CUST_ORD_NO" },
  { type: "text", headerName: "LBL_DESTINATION_CODE", field: "TO_LOC_CD" },
  { type: "text", headerName: "LBL_DESTINATION_NAME", field: "TO_LOC_NM" },
  { type: "text", headerName: "LBL_DESTINATION_ZIP_CODE", field: "TO_ZIP_CD" },
  { type: "text", headerName: "LBL_TO_LAT", field: "TO_LAT" },
  { type: "text", headerName: "LBL_TO_LON", field: "TO_LON" },
  { type: "text", headerName: "주문타입", field: "ORD_TP" },
  { type: "text", headerName: "주문번호", field: "SHPM_NO" },
  { type: "text", headerName: "콘솔", field: "MIT_CLSS_CD" },
  { type: "text", headerName: "고객사코드", field: "CUST_CD" },
  { type: "text", headerName: "고객사명", field: "CUST_NM" },
  { type: "text", headerName: "LBL_DEPARTURE_CODE", field: "FRM_LOC_ID" },
  { type: "text", headerName: "LBL_DEPARTURE_CODE", field: "FRM_LOC_CD" },
  { type: "text", headerName: "LBL_DEPARTURE_NAME", field: "FRM_LOC_NM" },
  { type: "text", headerName: "LBL_DEPARTURE_COUNTRY_NAME", field: "FRM_CNTY_NM" },
  { type: "text", headerName: "LBL_FROM_CITY_NM", field: "FRM_CTY_NM" },
  { type: "text", headerName: "LBL_FROM_STATE_NM", field: "FRM_STT_NM" },
  { type: "text", headerName: "LBL_DEPARTURE_ZIP_CODE", field: "FRM_ZIP_CD" },
  { type: "text", headerName: "LBL_FROM_LAT", field: "FRM_LAT" },
  { type: "text", headerName: "LBL_FROM_LON", field: "FRM_LON" },
];

// ── 운송비내역 서브그리드 컬럼 (센차: TenderReceiveDispatchCarrRate columns) ──
// setRowData: 삭제 체크박스 클릭 시 행 제거용 (센차에는 없던 UX, React 방식 추가)
export const AP_SETL_COLUMN_DEFS = (setRowData: (updater: any) => void) => [
  { headerName: "No" },
  {
    type: "text",
    // 신규 행만 삭제 체크박스 노출 (센차: rowStatus:'I' 행만 삭제 가능)
    headerName: "삭제",
    field: "_delete",
    width: 60,
    filter: false,
    floatingFilter: false,
    cellRenderer: (params: any) => {
      if (!isInserted(params.data)) return null;
      return (
        <div className="flex items-center justify-start h-full">
          <input
            type="checkbox"
            className="ag-input-field-input ag-checkbox-input"
            onChange={(e) => {
              if (e.target.checked) {
                setRowData((prev: any) =>
                  prev.filter((row: any) => row !== params.data),
                );
              }
            }}
          />
        </div>
      );
    },
  },
  { type: "text", field: "DSPCH_NO", hide: true },
  { type: "text", headerName: "항목코드", field: "CHG_CD" },
  { type: "text", headerName: "LBL_AP_CTG", field: "CHG_NM" },
  { type: "text", headerName: "LBL_REG_RATE", field: "RATE", editable: true },
  { type: "text", headerName: "LBL_CONFIRM_COST", field: "CFM_COST" },
  { type: "text", headerName: "LBL_CFM_DESC", field: "RMK" },
  { type: "text", headerName: "LBL_INSERT_DATE", field: "CRE_DTTM" },
  { type: "text", headerName: "LBL_INSERT_PERSON_ID", field: "CRE_USR_ID" },
  { type: "text", headerName: "LBL_UPDATE_TIME", field: "UPD_DTTM" },
  { type: "text", headerName: "LBL_UPDATE_PERSON_ID", field: "UPD_USR_ID" },
];
