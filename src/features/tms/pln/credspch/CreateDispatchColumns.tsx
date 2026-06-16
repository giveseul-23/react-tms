// 그리드 컬럼 정의 — audit 컬럼(등록자/등록일시/수정자/수정일시)은 OMIT (서버 화면엔 있으나 표준 미적용).
// 모든 컬럼 읽기전용(서버 insertDisabled+editDisabled). 편집은 팝업/저장 플로우로만 발생.

// CUST_ORD_NO 강조(굵게+강조색), MIT_CLSS_CD 빨강 굵게
const EMP_STYLE = { fontWeight: "bold" } as const;
const RED_BOLD_STYLE = { color: "red", fontWeight: "bold" } as const;

// ORD_NO: 고객 픽업(CUST_PICKUP_YN==='Y') 행이면 배경/글자 빨강
const ordNoCellStyle = (p: any) =>
  p?.data?.CUST_PICKUP_YN === "Y"
    ? { backgroundColor: "#ffecec", color: "red" }
    : undefined;

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },

  // ── hidden (저장 플로우에서 carry-through 되는 필드들) ──
  { type: "text", headerName: "ITNR_ID", field: "ITNR_ID", hidden: true },
  { type: "text", headerName: "FRM_ZIP_CD", field: "FRM_ZIP_CD", hidden: true },
  { type: "text", headerName: "FRM_LAT", field: "FRM_LAT", hidden: true },
  { type: "text", headerName: "FRM_LON", field: "FRM_LON", hidden: true },
  { type: "text", headerName: "TO_ZIP_CD", field: "TO_ZIP_CD", hidden: true },
  { type: "text", headerName: "TO_LAT", field: "TO_LAT", hidden: true },
  { type: "text", headerName: "TO_LON", field: "TO_LON", hidden: true },
  { type: "text", headerName: "AP_PROC_TP", field: "AP_PROC_TP", hidden: true },
  { type: "text", headerName: "CARR_CD", field: "CARR_CD", hidden: true },
  { type: "text", headerName: "VEH_ID", field: "VEH_ID", hidden: true },
  { type: "text", headerName: "VEH_TP_CD", field: "VEH_TP_CD", hidden: true },
  { type: "text", headerName: "VEH_NO", field: "VEH_NO", hidden: true },
  { type: "text", headerName: "DRVR_ID", field: "DRVR_ID", hidden: true },
  { type: "text", headerName: "DRVR_NM", field: "DRVR_NM", hidden: true },
  { type: "text", headerName: "ASST_ID", field: "ASST_ID", hidden: true },
  { type: "text", headerName: "ASST_NM", field: "ASST_NM", hidden: true },
  { type: "text", headerName: "MIN_SHPM_NO", field: "MIN_SHPM_NO", hidden: true },
  { type: "text", headerName: "PPT_SHPM_SPLIT_YN", field: "ALLOW_SHIPMENT_SPLIT", hidden: true },
  { type: "text", headerName: "FromAddressId", field: "FRM_ADDR_ID", hidden: true },
  { type: "text", headerName: "ToAddressId", field: "TO_ADDR_ID", hidden: true },
  { type: "text", headerName: "FromLocationId", field: "FRM_LOC_ID", hidden: true },
  { type: "text", headerName: "ToLocationId", field: "TO_LOC_ID", hidden: true },
  { type: "text", noLang: true, headerName: "ShipmentId", field: "SHPM_ID", hidden: true },
  { type: "text", noLang: true, headerName: "InterfaceReceiveType", field: "IF_RCV_TP", hidden: true },
  { type: "text", headerName: "TO_DTL_ADDR2", field: "TO_DTL_ADDR2", align: "left", hidden: true },
  { type: "text", headerName: "FRM_DTL_ADDR2", field: "FRM_DTL_ADDR2", align: "left", hidden: true },
  { type: "text", headerName: "SEQ_NO", field: "SEQ_NO", align: "right", hidden: true },
  { type: "text", headerName: "LBL_BATCH", field: "BATCH_NO", align: "right", width: 40, hidden: true },
  { type: "text", headerName: "LBL_DEPARTURE_COUNTRY_NAME", field: "FRM_CTRY_NM", align: "left", hidden: true },
  { type: "text", headerName: "LBL_DESTINATION_COUNTRY_NAME", field: "TO_CTRY_NM", align: "left", hidden: true },

  // ── 표시 컬럼 ──
  { type: "date", headerName: "LBL_REQUESTED_DELIVERY_DATE", field: "DLVRY_DT", align: "center", width: 100 },
  { type: "text", headerName: "LBL_DEPARTURE_CODE", field: "FRM_LOC_CD", align: "center", width: 100 },
  { type: "text", headerName: "LBL_DEPARTURE_NAME", field: "FRM_LOC_NM", align: "left", width: 150 },
  { type: "text", headerName: "LBL_DEPARTURE_ADDRESS", field: "FRM_DTL_ADDR1", align: "left", width: 250 },
  { type: "text", headerName: "LBL_DESTINATION_CD", field: "TO_LOC_CD", align: "center", width: 100 },
  { type: "text", headerName: "LBL_DESTINATION_NM", field: "TO_LOC_NM", align: "left", width: 150 },
  { type: "text", headerName: "LBL_DESTINATION_ADDRESS", field: "TO_DTL_ADDR1", align: "left", width: 250 },
  { type: "text", headerName: "LBL_TEMP_TCD", field: "CMDT_NM", align: "center", width: 80 },
  { type: "numeric", headerName: "LBL_PLN_NET_VOL", field: "PLN_NET_VOL", align: "right", width: 100 },
  { type: "numeric", headerName: "LBL_PLN_GRS_VOL", field: "PLN_GRS_VOL", align: "right", width: 100 },
  { type: "numeric", headerName: "LBL_PLN_NET_WGT", field: "PLN_NET_WGT", align: "right", width: 100 },
  { type: "numeric", headerName: "LBL_PLN_GRS_WGT", field: "PLN_GRS_WGT", align: "right", width: 100 },
  { type: "numeric", headerName: "LBL_PLN_PLT_QTY", field: "PLN_PLT_QTY", align: "right", width: 100 },
  { type: "numeric", headerName: "LBL_PLN_RTNR_QTY", field: "PLN_RTNR_QTY", align: "right", width: 100 },
  { type: "numeric", headerName: "LBL_PLN_PBOX_QTY", field: "PLN_PBOX_QTY", align: "right", width: 100 },
  { type: "numeric", headerName: "LBL_PLN_BOX_QTY", field: "PLN_BOX_QTY", align: "right", width: 100 },
  { type: "numeric", headerName: "LBL_FLEX_QTY1", field: "PLN_FLEX_QTY1", align: "right", summable: true },
  { type: "numeric", headerName: "LBL_FLEX_QTY2", field: "PLN_FLEX_QTY2", align: "right", summable: true },
  { type: "numeric", headerName: "LBL_FLEX_QTY3", field: "PLN_FLEX_QTY3", align: "right", summable: true },
  { type: "numeric", headerName: "LBL_FLEX_QTY4", field: "PLN_FLEX_QTY4", align: "right", summable: true },
  { type: "numeric", headerName: "LBL_FLEX_QTY5", field: "PLN_FLEX_QTY5", align: "right", summable: true },
  { type: "text", headerName: "LBL_CUSTOMER_CODE", field: "CUST_CD", align: "center", width: 100 },
  { type: "text", headerName: "LBL_CUSTOMER_NAME", field: "CUST_NM", align: "left", width: 100 },
  { type: "text", headerName: "LBL_SHIPMENT_NUMBER", field: "SHPM_NO", align: "center", width: 150 },
  { type: "text", headerName: "LBL_ORDER_NO", field: "ORD_NO", align: "center", width: 150, cellStyle: ordNoCellStyle },
  { type: "text", headerName: "LBL_CUSTOMER_ORDER_NO", field: "CUST_ORD_NO", align: "center", width: 150, cellStyle: EMP_STYLE },
  { type: "text", headerName: "LBL_PLAN_ID", field: "PLN_ID", align: "center", width: 100 },
  { type: "text", headerName: "LBL_DIVISION_CODE", field: "DIV_CD", align: "center", width: 100 },
  { type: "text", headerName: "LBL_DIVISION_NAME", field: "DIV_NM", align: "left", width: 100 },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_CODE", field: "LGST_GRP_CD", align: "center", width: 120 },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_NAME", field: "LGST_GRP_NM", align: "left", width: 150 },
  { type: "combo", headerName: "LBL_ORDER_TYPE", field: "SHPM_TP", codeKey: "shpmTpList", align: "center", width: 100 },
  { type: "text", headerName: "LBL_MIT_CLASS_CD", field: "MIT_CLSS_CD", align: "center", width: 100, cellStyle: RED_BOLD_STYLE },
  { type: "numeric", headerName: "LBL_PLANNED_QTY", field: "PLN_QTY", align: "right", width: 100 },
  { type: "text", headerName: "LBL_CUST_PICKUP_YN", field: "CUST_PICKUP_YN", align: "center", width: 100 },
];

export const SUB01_COLUMN_DEFS = [
  { headerName: "No" },

  // ── hidden ──
  { type: "text", noLang: true, headerName: "ShipmentId", field: "SHPM_ID", hidden: true },
  { type: "text", noLang: true, headerName: "ShipmentType", field: "SHPM_TP", hidden: true },
  { type: "text", headerName: "LGST_GRP_CD", field: "LGST_GRP_CD", hidden: true },
  { type: "text", headerName: "SHPM_NO", field: "SHPM_NO", hidden: true },
  { type: "text", noLang: true, headerName: "CustCd", field: "CUST_CD", hidden: true },
  { type: "text", noLang: true, headerName: "ShipmentDetailCd", field: "SHPM_DTL_ID", hidden: true },
  { type: "text", noLang: true, headerName: "OrderLineNumber", field: "ORD_LINE_NO", hidden: true },
  { type: "text", noLang: true, headerName: "ItemSystemCd", field: "ITEM_SYS_CD", hidden: true },
  { type: "text", noLang: true, headerName: "CmdtCd", field: "CMDT_CD", hidden: true },
  { type: "text", headerName: "CUST_ORD_NO", field: "CUST_ORD_NO", hidden: true },
  { type: "text", headerName: "ORD_NO", field: "ORD_NO", hidden: true },

  // ── 표시 컬럼 ──
  { type: "text", headerName: "LBL_ITEM_CD", field: "CUST_ITEM_CD", align: "center", width: 100 },
  { type: "text", headerName: "LBL_ITEM_NM", field: "CUST_ITEM_NM", align: "left", width: 100 },
  { type: "text", headerName: "LBL_TEMP_TCD", field: "CMDT_NM", align: "center", width: 100 },
  { type: "numeric", headerName: "LBL_PLN_ORD_QTY", field: "PLN_ORD_QTY", align: "right", width: 100 },
  { type: "combo", headerName: "LBL_PLN_ORD_QTY_UOM", field: "PLN_ORD_QTY_UOM", codeKey: "itmUomList", align: "left", width: 100 },
  { type: "numeric", headerName: "LBL_PLN_INV_QTY", field: "PLN_INV_QTY", align: "right", width: 100 },
  { type: "combo", headerName: "LBL_PLN_INV_QTY_UOM", field: "PLN_INV_QTY_UOM", codeKey: "itmUomList", align: "left", width: 100 },
  { type: "numeric", headerName: "LBL_PLN_NET_VOL", field: "PLN_NET_VOL", align: "right", width: 100 },
  { type: "numeric", headerName: "LBL_PLN_GRS_VOL", field: "PLN_GRS_VOL", align: "right", width: 100 },
  { type: "numeric", headerName: "LBL_PLN_NET_WGT", field: "PLN_NET_WGT", align: "right", width: 100 },
  { type: "numeric", headerName: "LBL_PLN_GRS_WGT", field: "PLN_GRS_WGT", align: "right", width: 100 },
  { type: "numeric", headerName: "LBL_PLN_PLT_QTY", field: "PLN_PLT_QTY", align: "right", width: 100 },
  { type: "numeric", headerName: "LBL_PLN_RTNR_QTY", field: "PLN_RTNR_QTY", align: "right", width: 100 },
  { type: "numeric", headerName: "LBL_PLN_PBOX_QTY", field: "PLN_PBOX_QTY", align: "right", width: 100 },
  { type: "numeric", headerName: "LBL_PLN_BOX_QTY", field: "PLN_BOX_QTY", align: "right", width: 100 },
  { type: "numeric", headerName: "LBL_PLANNED_FLEX_QTY1", field: "PLN_FLEX_QTY1", align: "right", width: 100 },
  { type: "numeric", headerName: "LBL_PLANNED_FLEX_QTY2", field: "PLN_FLEX_QTY2", align: "right", width: 100 },
  { type: "numeric", headerName: "LBL_PLANNED_FLEX_QTY3", field: "PLN_FLEX_QTY3", align: "right", width: 100 },
  { type: "numeric", headerName: "LBL_PLANNED_FLEX_QTY4", field: "PLN_FLEX_QTY4", align: "right", width: 100 },
  { type: "numeric", headerName: "LBL_PLANNED_FLEX_QTY5", field: "PLN_FLEX_QTY5", align: "right", width: 100 },
  { type: "check", headerName: "LBL_SORTER_YN", field: "SORTER_YN", align: "center", width: 100, hidden: true },
  { type: "text", headerName: "LBL_SAP_ORDER_TP", field: "SAP_ORD_TP", align: "right", width: 100, hidden: true },
  { type: "check", headerName: "LBL_PP_YN", field: "PP_YN", align: "center", width: 100, hidden: true },
  { type: "text", headerName: "LBL_ITEM_TEMP_TCD", field: "ITEM_TEMP_TCD", align: "right", width: 100, hidden: true },
  { type: "check", headerName: "LBL_PL_YN", field: "PL_YN", align: "center", width: 100, hidden: true },
  { type: "text", headerName: "LBL_TEAM_CD", field: "TEAM_CD", align: "right", width: 100, hidden: true },
  { type: "text", headerName: "LBL_TEAM_NM", field: "TEAM_NM", align: "right", width: 100, hidden: true },
  { type: "text", headerName: "LBL_DVLRY_CATGRY_CD", field: "DVLRY_CATGRY_CD", align: "right", width: 120, hidden: true },
];
