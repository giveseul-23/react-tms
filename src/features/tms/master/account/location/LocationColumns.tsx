import { makeAuditColumns } from "@/app/components/grid/commonColumns";

// 메인 착지 그리드
export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_LOCATION_CODE", field: "LOC_CD" },
  { type: "text", headerName: "LBL_LOCATION_NAME", field: "LOC_NM" },
  { type: "text", headerName: "LBL_LOCATION_TYPE", field: "LOC_TP", codeKey: "locTp" },
  { type: "text", headerName: "LBL_ADDR", field: "DTL_ADDR1" },
  { type: "text", headerName: "LBL_ZIP_CODE", field: "ZIP_CD" },
  { type: "text", headerName: "LBL_LATITUDE", field: "LAT" },
  { type: "text", headerName: "LBL_LONGITUDE", field: "LON" },
  { type: "text", headerName: "LBL_FIXED_ADDR", field: "FIXED_ADDR1" },
  { type: "text", headerName: "LBL_BASE_TIME", field: "FIX_LD_UNLD_MIN" },
  { type: "text", headerName: "LBL_PRMY_LOC_CD", field: "PRMY_LOC_CD" },
  { type: "text", headerName: "LBL_GFENCE_RAD", field: "GFENCE_RAD" },
  { type: "text", headerName: "LBL_REPRESENTITIVE", field: "REP_NM" },
  { type: "text", headerName: "LBL_REPRESENTATIVE_TEL_NO", field: "REP_TELNO" },
  { type: "text", headerName: "LBL_REPRESENTATIVE_MBL_NO", field: "REP_MOBNO" },
  { type: "text", headerName: "LBL_REPRESENTATIVE_FAX", field: "REP_FAXNO" },
  { type: "text", headerName: "LBL_REPRESENTATIVE_EMAIL", field: "REP_EMAIL" },
  { type: "text", headerName: "LBL_BIZ_REG_CD", field: "BIZ_REG_NO" },
  { type: "text", headerName: "LBL_BIZ_TP_CD", field: "BIZ_TP_CD" },
  { type: "text", headerName: "LBL_BIZ_ITEM_CD", field: "BIZ_ITEM_CD" },
  { type: "text", headerName: "LBL_STORE_CD", field: "STORE_CD" },
  { type: "text", headerName: "LBL_REP_CUST_CD", field: "REP_CUST_CD" },
  { type: "text", headerName: "LBL_POD_AMOUNT_DSPL_YN", field: "AMOUNT_DP_YN" },
  { type: "text", headerName: "LBL_USE_YN", field: "USE_YN" },
  { type: "text", headerName: "LBL_STATE_CODE", field: "STT_CD" },
  { type: "text", headerName: "LBL_STATE_NAME", field: "STT_NM" },
  { type: "text", headerName: "LBL_CITY_CODE", field: "CTY_CD" },
  { type: "text", headerName: "LBL_CITY_NAME", field: "CTY_NM" },
  { type: "text", headerName: "LBL_TIMEZONE", field: "ADDR_TZ" },
  { type: "text", headerName: "LBL_UDF1", field: "UDF1" },
  { type: "text", headerName: "LBL_UDF2", field: "UDF2" },
  { type: "text", headerName: "LBL_UDF3", field: "UDF3" },
  { type: "text", headerName: "LBL_UDF4", field: "UDF4" },
  ...makeAuditColumns({
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// 진입제약
export const ENTRY_RESTRICTION_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_VEHICLE_TYPE", field: "VEH_TP_CD" },
  { type: "text", headerName: "LBL_VEHICLE_TYPE_NAME", field: "VEH_TP_NM" },
  ...makeAuditColumns({
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// 지정차량
export const ASSIGNED_VEHICLE_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_VEHICLE_CODE", field: "VEH_ID" },
  { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO" },
  { type: "text", headerName: "LBL_VEHICLE_TYPE_CODE", field: "VEH_TP_CD" },
  { type: "text", headerName: "LBL_VEHICLE_TYPE_NAME", field: "VEH_TP_NM" },
  { type: "text", headerName: "LBL_CARRIER_CODE", field: "CARR_CD" },
  { type: "text", headerName: "LBL_CARRIER_NAME", field: "CARR_NM" },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_CODE", field: "LGST_GRP_CD" },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_NAME", field: "LGST_GRP_NM" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// 제외차량
export const EXCLD_VEH_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_VEHICLE_CODE", field: "VEH_ID" },
  { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO" },
  { type: "text", headerName: "LBL_VEHICLE_TYPE_CODE", field: "VEH_TP_CD" },
  { type: "text", headerName: "LBL_VEHICLE_TYPE_NAME", field: "VEH_TP_NM" },
  { type: "text", headerName: "LBL_CARRIER_CODE", field: "CARR_CD" },
  { type: "text", headerName: "LBL_CARRIER_NAME", field: "CARR_NM" },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_CODE", field: "LGST_GRP_CD" },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_NAME", field: "LGST_GRP_NM" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// 일자금지
export const DATE_PROHIBITION_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_PROHIBIT_FRM_DT", field: "PROHIBIT_FRM_DT" },
  { type: "text", headerName: "LBL_PROHIBIT_TO_DT", field: "PROHIBIT_TO_DT" },
  { type: "text", headerName: "LBL_REMARK", field: "RMRK" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// 등록권역
export const REGISTERED_ZONE_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_LOCATION_CODE", field: "LOC_CD" },
  { type: "text", headerName: "LBL_DIVISION", field: "DIV_CD" },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_CODE", field: "LGST_GRP_CD" },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_NAME", field: "LGST_GRP_NM" },
  { type: "text", headerName: "LBL_ZONE_CD", field: "ZN_CD" },
  { type: "text", headerName: "LBL_ZONE_NM", field: "ZN_NM" },
  { type: "text", headerName: "LBL_COUNTRY_CODE", field: "CTRY_CD" },
  { type: "text", headerName: "LBL_COUNTRY_NAME", field: "CTRY_NM" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
  }),
];

// 휴무일
export const HOLIDAY_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_CLOSED_DAY", field: "CLOSED_DTTM" },
  ...makeAuditColumns({
    delete: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// 선호운송협력사
export const PREFERRED_CARRIER_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_CODE", field: "LGST_GRP_CD" },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_NAME", field: "LGST_GRP_NM" },
  { type: "text", headerName: "LBL_CARRIER_CODE", field: "CARR_CD" },
  { type: "text", headerName: "LBL_CARRIER_NAME", field: "CARR_NM" },
  { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO" },
  { type: "text", headerName: "LBL_VEHICLE_TYPE_NAME", field: "VEH_TP_NM" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// 도착요구시간관리
export const ARRIVAL_REQUEST_TIME_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_FROM_DATE", field: "FRM_DTTM" },
  { type: "text", headerName: "LBL_TO_DATE", field: "TO_DTTM" },
  { type: "text", headerName: "LBL_DEPARTURE_CODE", field: "FRM_LOC_CD" },
  { type: "text", headerName: "LBL_DEPARTURE_NAME", field: "FRM_LOC_NM" },
  { type: "text", headerName: "LBL_DESTINATION_CD", field: "LOC_CD" },
  { type: "text", headerName: "LBL_DESTINATION_NM", field: "LOC_NM" },
  { type: "text", headerName: "LBL_FRM_REQ_DLVRY_TW", field: "FRM_REQ_DLVRY_TW" },
  { type: "text", headerName: "LBL_TO_REQ_DLVRY_TW", field: "TO_REQ_DLVRY_TW" },
  ...makeAuditColumns({
    delete: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// SMS
export const SMS_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_MOBILE_NM", field: "MOBILE_NM" },
  { type: "text", headerName: "LBL_MOBILE_NO", field: "MOBILE_NO" },
  { type: "text", headerName: "LBL_REMARK", field: "RMK" },
  { type: "text", headerName: "LBL_USE_YN", field: "USE_YN" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// 착지역할
export const LOCATION_ROLE_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_TP_NM", field: "ROLE_TP", codeKey: "locRoleTp" },
  ...makeAuditColumns({
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// LBL_LOC_SALES
export const LOC_SALES_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_CUSTOMER_NAME", field: "CUST_NM" },
  { type: "text", headerName: "LBL_SALES_ORG_NM", field: "DIV_NM" },
  { type: "text", headerName: "LBL_DISTBUTE_CHANNEL", field: "DIST_CHANNEL" },
  { type: "text", headerName: "LBL_PLANT", field: "DELI_PLANT_CD" },
  { type: "text", headerName: "LBL_SALES_DIST_NM", field: "SALES_DIST_NM" },
  { type: "text", headerName: "LBL_POB_NM", field: "POB_NM" },
  { type: "text", headerName: "LBL_SALES_GRP_NM", field: "SALES_GRP_NM" },
  { type: "text", headerName: "LBL_PLT_USE_YN", field: "PLT_USE_YN" },
  { type: "text", headerName: "LBL_CUST_ORD_HLD", field: "CUST_ORD_HLD" },
  {
    type: "text",
    headerName: "LBL_LOC_PRIME_TP",
    field: "PRIME_FLAG",
    codeKey: "locPrimeTp",
  },
  ...makeAuditColumns({
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// 기타
export const ETC_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_DIVISION_CODE", field: "DIV_CD" },
  { type: "text", headerName: "LBL_DIVISION_NAME", field: "DIV_NM" },
  { type: "text", headerName: "LBL_MOBILE_MEMO", field: "MEMO_DESC" },
  { type: "text", headerName: "LBL_AMOUNT_DP_YN", field: "AMOUNT_DP_YN" },
  { type: "text", headerName: "LBL_FILE_ATTACH", field: "ORG_FILE_NM" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// 주문유형별계획ID
export const ORDER_TYPE_PLAN_ID_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_LOCATION_CODE", field: "LOC_CD" },
  { type: "text", headerName: "LBL_LOCATION_NAME", field: "LOC_NM" },
  { type: "text", headerName: "LBL_ORD_TP_CD", field: "ORD_TP_CD" },
  { type: "text", headerName: "LBL_ORD_TP_NM", field: "ORD_TP_NM" },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP", field: "LGST_GRP_CD" },
  { type: "text", headerName: "LBL_DIVISION", field: "DIV_CD" },
  { type: "text", headerName: "LBL_PLAN_ID", field: "PLN_ID" },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];
