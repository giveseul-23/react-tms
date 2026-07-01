// 그리드 컬럼 정의 (서버 SettlementOrderContractMain 기준)
// audit 컬럼(등록자/등록일시/수정자/수정일시)은 DataGrid 가 자동 추가(model.bind).
// 조회 결과 그리드 — 전 컬럼 읽기전용(서버 editType 은 위젯 타입 결정용).

import type { ReactNode } from "react";

const AR_RESULT_MSG_RED = "rgb(220, 38, 38)";

const MAIN_COLUMN_DEFS_BASE = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_CUSTOMER_CODE", field: "CUST_CD", align: "center" },
  { type: "text", headerName: "LBL_CUSTOMER_NAME", field: "CUST_NM", align: "left" },
  { type: "text", headerName: "LBL_ORDER_NO", field: "ORD_NO", align: "center" },
  { type: "combo", headerName: "LBL_SHIPMENT_OPERATIONAL_STATUS", field: "SHPM_OP_STS", statusStyle: "SHPM_OP_STS", codeKey: "shpmOperStatus", align: "center" },
  { type: "combo", headerName: "LBL_AR_FI_STATUS", field: "AR_FI_STS", statusStyle: "AR_FI_STS", codeKey: "arFiStatus", align: "center" },
  {
    type: "combo",
    headerName: "MSG_AR_RESULT_MESSGE",
    field: "AR_CALC_RSLT_MSG_CD",
    codeKey: "arResultMessage",
    align: "left",
    width: 250,
  },
  { type: "text", headerName: "LBL_DEPARTURE_CODE", field: "FRM_LOC_CD", align: "center" },
  { type: "text", headerName: "LBL_DEPARTURE_NAME", field: "FRM_LOC_NM", align: "left" },
  { type: "text", headerName: "LBL_DESTINATION_CD", field: "TO_LOC_CD", align: "center" },
  { type: "text", headerName: "LBL_DESTINATION_NM", field: "TO_LOC_NM", align: "left" },
  { type: "numeric", headerName: "LBL_CFM_NET_WGT", field: "CFM_NET_WGT", align: "right" },
  { type: "numeric", headerName: "LBL_CFM_GRS_WGT", field: "CFM_GRS_WGT", align: "right" },
  { type: "numeric", headerName: "LBL_CFM_NET_VOL", field: "CFM_NET_VOL", align: "right" },
  { type: "numeric", headerName: "LBL_CFM_GRS_VOL", field: "CFM_GRS_VOL", align: "right" },
  { type: "numeric", headerName: "LBL_CFM_PLT_QTY", field: "CFM_PLT_QTY", align: "right" },
  { type: "numeric", headerName: "LBL_CFM_RTNR_QTY", field: "CFM_RTNR_QTY", align: "right" },
  { type: "numeric", headerName: "LBL_CFM_PBOX_QTY", field: "CFM_PBOX_QTY", align: "right" },
  { type: "numeric", headerName: "LBL_CFM_BOX_QTY", field: "CFM_BOX_QTY", align: "right" },
  { type: "numeric", headerName: "LBL_CONFIRMED_FLEX_QTY1", field: "CFM_FLEX_QTY1", align: "right" },
  { type: "numeric", headerName: "LBL_CONFIRMED_FLEX_QTY2", field: "CFM_FLEX_QTY2", align: "right" },
  { type: "numeric", headerName: "LBL_CONFIRMED_FLEX_QTY3", field: "CFM_FLEX_QTY3", align: "right" },
  { type: "numeric", headerName: "LBL_CONFIRMED_FLEX_QTY4", field: "CFM_FLEX_QTY4", align: "right" },
  { type: "numeric", headerName: "LBL_CONFIRMED_FLEX_QTY5", field: "CFM_FLEX_QTY5", align: "right" },
  { type: "text", headerName: "LBL_PAY_CARRIER", field: "PAY_CARR_CD", align: "center" },
  { type: "text", headerName: "LBL_PAY_CARRIER_NAME", field: "PAY_CARR_NM", align: "left" },
  { type: "text", headerName: "LBL_VEHICLE_CODE", field: "VEH_ID", align: "center" },
  { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO", align: "center" },
  { type: "text", headerName: "LBL_VEHICLE_TYPE_NAME", field: "VEH_TP_NM", align: "left" },
  { type: "text", headerName: "LBL_DRIVER_CODE", field: "DRVR_ID", align: "center" },
  { type: "text", headerName: "LBL_DRIVER_NAME", field: "DRVR_NM", align: "center" },
  { type: "date", headerName: "LBL_DLVRY_DATE", field: "DLVRY_DT", align: "center" },
  { type: "date", headerName: "LBL_DEP_DATE", field: "DEP_DATE", align: "center" },
  { type: "date", headerName: "LBL_ARRIVAL_DATE", field: "ARR_DATE", align: "center" },
  { type: "date", headerName: "LBL_POD_EVNT_DATE", field: "POD_DATE", align: "center" },
] as const;

/** 매출계산결과메시지: 값이 있으면 빨간색 (센차 onRenderer color:red 대응) */
function arResultMessageCellRenderer(
  codeMap?: Record<string, Record<string, string>>,
) {
  return (params: { value?: string | null }): ReactNode => {
    const code = params.value;
    if (code === "" || code == null) {
      return <span className="px-2 py-0.5 rounded-lg text-xs text-gray-400">-</span>;
    }
    const label = codeMap?.arResultMessage?.[String(code)] ?? code;
    return (
      <span
        className="px-2 py-0.5 rounded-lg text-xs"
        style={{ color: AR_RESULT_MSG_RED }}
      >
        {label}
      </span>
    );
  };
}

/** codeMap 연동 — align+cellStyle 병합은 공통 processColumn 미사용, 화면 전용 cellRenderer */
export function buildMainColumnDefs(
  codeMap?: Record<string, Record<string, string>>,
) {
  return MAIN_COLUMN_DEFS_BASE.map((col) => {
    if ((col as { field?: string }).field !== "AR_CALC_RSLT_MSG_CD") return col;
    return {
      ...col,
      cellRenderer: arResultMessageCellRenderer(codeMap),
    };
  });
}

export const MAIN_COLUMN_DEFS = MAIN_COLUMN_DEFS_BASE;
