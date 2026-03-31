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

// ── 메인 그리드 컬럼 (센차: TenderReceiveDispatchMain columns) ────
// codeMap: 공통코드 → 명칭 변환용 (센차: bindStore + displayField)
export const MAIN_COLUMN_DEFS = (
  codeMap: Record<string, Record<string, string>>
) => [
  { headerName: "No" },
  {
    // 센차: LBL_AP_FI_STS (매입정산진행상태) + setDispatchOperationStatusColor
    headerName: "정산진행상태",
    field: "AP_FI_STS",
    cellRenderer: (params: any) => {
      const code = params.value;
      const label = codeMap.apFiSts?.[String(code)] ?? code;
      const cls =
        DISPATCH_STATUS_COLOR_MAP[String(code)] ?? "bg-gray-100 text-gray-600";
      return (
        <span className={`px-2 py-0.5 rounded-lg text-xs ${cls}`}>
          {label}
        </span>
      );
    },
  },
  // 센차: LBL_LOGISTICS_GROUP (물류운영그룹)
  { headerName: "물류운영그룹", field: "LGST_GRP_CD" },
  // 센차: LBL_REQUESTED_DELIVERY_DATE (납품일)
  { headerName: "납품일", field: "DLVRY_DT" },
  // 센차: LBL_DISPATCH_NO (배차번호)
  { headerName: "배차번호", field: "DSPCH_NO" },
  {
    // 센차: LBL_DISPATCH_OPERATIONAL_STATUS + setDispatchOperationStatusColor
    headerName: "배차진행상태",
    field: "DSPCH_OP_STS",
    cellRenderer: (params: any) => {
      const code = params.value;
      const label = codeMap.dspchOpSts?.[String(code)] ?? code;
      const cls =
        DISPATCH_STATUS_COLOR_MAP[String(code)] ?? "bg-gray-100 text-gray-600";
      return (
        <span className={`px-2 py-0.5 rounded-lg text-xs ${cls}`}>
          {label}
        </span>
      );
    },
  },
  // 센차: LBL_CARRIER_NAME (운송사명)
  { headerName: "운송협력사명", field: "CARR_NM" },
  // 센차: LBL_VEHICLE_TYPE_NAME (차량유형명)
  { headerName: "차량유형명", field: "VEH_TP_NM" },
  { headerName: "입차순서", field: "ETRNC_SEQ" },
  // 센차: LBL_VEH_NO (차량번호)
  { headerName: "차량번호", field: "VEH_NO" },
  // 센차: LBL_DRIVER_NAME (운전자명)
  { headerName: "운전자명", field: "DRVR_NM" },
  // 센차: LBL_DEPARTURE_NAME (출발지명)
  { headerName: "출발지명", field: "FRM_LOC_NM" },
  // 센차: LBL_TRCK_NO (추적번호) - editType:'text' (편집 가능)
  { headerName: "추적번호", field: "TRCK_NO", type: "numeric" },
  // 센차: LBL_SEND_SMS_DTTM (SMS전송일시)
  { headerName: "SMS전송일시", field: "SMS_APP_INST_DTTM" },
  // 센차: LBL_SEND_NO (전송번호)
  { headerName: "전송번호", field: "SEND_NO" },
  // 센차: LBL_MEMO (메모)
  { headerName: "메모(운송요청)", field: "MEMO" },
  // 센차: LBL_STOP_CNT (경유처수)
  { headerName: "경유처수", field: "STOP_CNT", type: "numeric" },
  // 센차: LBL_CARR_RATE_BKNG_ALLWD_YN (운임예약가능여부)
  { headerName: "운임예약가능여부", field: "CARR_BOOKING_YN" },
  {
    // 센차: LBL_REG_RATE (등록금액) - editType:'number'
    headerName: "등록금액",
    field: "RATE",
    type: "numeric",
    editable: (params: any) => params.data._isNew,
    valueSetter: (params: any) => {
      params.data.RATE = params.newValue;
      return true;
    },
  },
  // 센차: LBL_CONFIRM_COST (확정금액)
  { headerName: "확정금액", field: "CFM_COST", type: "numeric" },
  // 센차: LBL_DIVISION (디비전)
  { headerName: "디비전", field: "DIV_CD" },
  { headerName: "물류운영그룹코드", field: "LGST_GRP_CD" },
  // 센차: LBL_DEPARTURE_CODE (출발지코드)
  { headerName: "출발지코드", field: "FRM_LOC_CD" },
  // 센차: LBL_TRIP_NO (연계배차번호) - TRIP_ID 있으면 파란색 배경
  { headerName: "연계배차번호", field: "TRIP_ID" },
  // 센차: LBL_TRIP_SEQ (연계배차순서)
  { headerName: "연계배차순서", field: "TRIP_SEQ", type: "numeric" },
  // 센차: LBL_VEHICLE_CODE (차량코드)
  { headerName: "차량코드", field: "VEH_ID" },
  // 센차: LBL_DRIVER_CODE (운전자코드)
  { headerName: "운전자코드", field: "DRVR_ID" },
  // 센차: LBL_BATCH (배송차수)
  { headerName: "배송차수", field: "BATCH_NO", type: "numeric" },
  // 센차: LBL_REQUEST_DATETIME (입차요청일시)
  { headerName: "입차요청일시", field: "REQ_ETRNC_DTTM" },
  // 센차: LBL_EXPECTED_DATETIME (입차예정일시)
  { headerName: "입차예정일시", field: "EXPCT_ETRNC_DTTM" },
  // 센차: LBL_ETRNC_RSN_DESC (입차지연사유설명)
  { headerName: "입차지연사유", field: "DLYD_ETRNC_RSN_DESC" },
  // 센차: LBL_CHK_TON_TYPE (운송사확인차량유형)
  { headerName: "차량유형", field: "CARR_CFM_VEH_TCD" },
  // 센차: LBL_INSERT_PERSON_ID (작성자/등록자)
  { headerName: "작성자/등록자", field: "CRE_USR_ID" },
  // 센차: LBL_INSERT_DATE (등록일자)
  { headerName: "등록일자", field: "CRE_DTTM" },
  // 센차: LBL_UPDATE_PERSON_ID (수정자)
  { headerName: "수정자", field: "UPD_USR_ID" },
  // 센차: LBL_UPDATE_TIME (수정일시)
  { headerName: "수정일시", field: "UPD_DTTM" },
];

// ── 경유처 서브그리드 컬럼 (센차: TenderReceiveDispatchSub01 columns) ──
export const STOP_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "배차번호",   field: "DSPCH_NO" },
  { headerName: "순번",       field: "STOP_SEQ" },
  { headerName: "착지코드",   field: "LOC_CD" },
  { headerName: "착지명",     field: "LOC_NM" },
  { headerName: "착지구분",   field: "STOP_TP" },
  { headerName: "주",         field: "STT_NM" },
  { headerName: "도시",       field: "CTY_NM" },
  { headerName: "상세주소1",  field: "DTL_ADDR1" },
  { headerName: "상세주소2",  field: "DTL_ADDR2" },
  { headerName: "위도",       field: "LAT" },
  { headerName: "경도",       field: "LON" },
  { headerName: "상차CBM",    field: "LDNG_VOL" },
  { headerName: "상차중량",   field: "LDNG_WGT" },
  { headerName: "상차FQ1",    field: "LDNG_FLEX_QTY1" },
  { headerName: "상차FQ2",    field: "LDNG_FLEX_QTY2" },
  { headerName: "상차FQ3",    field: "LDNG_FLEX_QTY3" },
  { headerName: "상차FQ4",    field: "LDNG_FLEX_QTY4" },
  { headerName: "상차FQ5",    field: "LDNG_FLEX_QTY5" },
  { headerName: "하차CBM",    field: "UNLDNG_VOL" },
  { headerName: "하차중량",   field: "UNLDNG_WGT" },
  { headerName: "하차FQ1",    field: "UNLDNG_FLEX_QTY1" },
  { headerName: "하차FQ2",    field: "UNLDNG_FLEX_QTY2" },
  { headerName: "하차FQ3",    field: "UNLDNG_FLEX_QTY3" },
  { headerName: "하차FQ4",    field: "UNLDNG_FLEX_QTY4" },
  { headerName: "하차FQ5",    field: "UNLDNG_FLEX_QTY5" },
];

// ── SMS 전송이력 서브그리드 컬럼 (센차: TenderReceiveDispatchSub04 columns) ──
export const SMS_COLUMN_DEFS = [
  { headerName: "No" },
  { headerName: "운송지시번호",   field: "ORD_NO" },
  { headerName: "고객주문번호",   field: "CUST_ORD_NO" },
  { headerName: "도착지코드",     field: "TO_LOC_CD" },
  { headerName: "도착지명",       field: "TO_LOC_NM" },
  { headerName: "도착지우편번호", field: "TO_ZIP_CD" },
  { headerName: "도착지위도",     field: "TO_LAT" },
  { headerName: "도착지경도",     field: "TO_LON" },
  { headerName: "주문타입",       field: "ORD_TP" },
  { headerName: "주문번호",       field: "SHPM_NO" },
  { headerName: "콘솔",           field: "MIT_CLSS_CD" },
  { headerName: "고객사코드",     field: "CUST_CD" },
  { headerName: "고객사명",       field: "CUST_NM" },
  { headerName: "출발지ID",       field: "FRM_LOC_ID" },
  { headerName: "출발지코드",     field: "FRM_LOC_CD" },
  { headerName: "출발지명",       field: "FRM_LOC_NM" },
  { headerName: "출발지국가",     field: "FRM_CNTY_NM" },
  { headerName: "출발지도시",     field: "FRM_CTY_NM" },
  { headerName: "출발지주",       field: "FRM_STT_NM" },
  { headerName: "출발지우편번호", field: "FRM_ZIP_CD" },
  { headerName: "출발지위도",     field: "FRM_LAT" },
  { headerName: "출발지경도",     field: "FRM_LON" },
];

// ── 운송비내역 서브그리드 컬럼 (센차: TenderReceiveDispatchCarrRate columns) ──
// setRowData: 삭제 체크박스 클릭 시 행 제거용 (센차에는 없던 UX, React 방식 추가)
export const AP_SETL_COLUMN_DEFS = (setRowData: (updater: any) => void) => [
  { headerName: "No" },
  {
    // 신규 행만 삭제 체크박스 노출 (센차: rowStatus:'I' 행만 삭제 가능)
    headerName: "삭제",
    field: "_delete",
    width: 60,
    filter: false,
    floatingFilter: false,
    cellRenderer: (params: any) => {
      if (!params.data._isNew) return null;
      return (
        <div className="flex items-center justify-start h-full">
          <input
            type="checkbox"
            className="ag-input-field-input ag-checkbox-input"
            onChange={(e) => {
              if (e.target.checked) {
                setRowData((prev: any) =>
                  prev.filter((row: any) => row !== params.data)
                );
              }
            }}
          />
        </div>
      );
    },
  },
  { field: "DSPCH_NO", hide: true },
  // 센차: 항목코드 (CHG_CD) - hidden
  { headerName: "항목코드",    field: "CHG_CD" },
  // 센차: LBL_AP_CTG (항목명)
  { headerName: "항목명",      field: "CHG_NM" },
  // 센차: LBL_REG_RATE (등록금액) - editType:'number'
  { headerName: "등록금액",    field: "RATE", editable: true },
  // 센차: LBL_CONFIRM_COST (확정금액)
  { headerName: "확정금액",    field: "CFM_COST" },
  { headerName: "확정사유내용", field: "RMK" },
  { headerName: "등록일자",    field: "CRE_DTTM" },
  { headerName: "작성자/등록자", field: "CRE_USR_ID" },
  { headerName: "수정일시",    field: "UPD_DTTM" },
  { headerName: "수정자",      field: "UPD_USR_ID" },
];
