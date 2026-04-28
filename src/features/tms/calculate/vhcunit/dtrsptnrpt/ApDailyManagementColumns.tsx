import { makeAuditColumns } from "@/app/components/grid/commonColumns";
import {
  CENTER,
  RIGHT,
  numberValueFormatter,
  negativeRedCenterCellStyle,
  negativeRedRightCellStyle,
} from "@/app/components/grid/commonFormatters";

// TODO: 근무계획/실적 배경색 — workTp / workTpExe 코드 매핑 확정 후 활성화
//   ExtJS 원본:
//     plan: value !== '근무' → #BBE6F6
//     exe:  value === '결근' → #ECABC5, value !== '근무' → #BBE6F6
//   AG Grid의 cellStyle 은 코드값('01' 등)을 받으므로 codeMap 로 라벨 치환 후 비교 필요.

// ─────────────────────────────────────────────────────────────
// 일일실적 (메인) 그리드 — HEAD (ExtJS createMainHeaderColumns 대응)
// ─────────────────────────────────────────────────────────────
export const DAILY_MAIN_HEAD = [
  { type: "text", headerName: "No", width: 40, cellStyle: RIGHT, pinned: "left" },
  { type: "text", field: "DIV_CD", hide: true },
  { type: "text", field: "LGST_GRP_CD", hide: true },
  { type: "text", field: "DLY_APPLN_ID", colId: "DLY_APPLN_ID_HIDDEN", hide: true },
  {
    type: "text",
    headerName: "LBL_VEH_TRANS_TCD",
    field: "TRANS_TCD",
    width: 80,
    pinned: "left",
    cellStyle: CENTER,
    codeKey: "vehicleTransType",
  },
  {
    type: "text",
    headerName: "LBL_DLVRY_DATE",
    field: "DLVRY_DT",
    width: 80,
    pinned: "left",
    cellStyle: CENTER,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_FINANCIAL_STATUS",
    field: "AP_FI_STS",
    width: 100,
    pinned: "left",
    cellStyle: CENTER,
    codeKey: "fiStsList",
    editable: false,
    // TODO: setApFinancialStatusColor 포팅 — 상태값별 배경/글자색
  },
  { type: "text", field: "VEH_ID", colId: "VEH_ID_HIDDEN", hide: true },
  { type: "text", field: "PAY_CARR_CD", hide: true },
  {
    type: "text",
    headerName: "LBL_VEHICLE_TYPE_NAME",
    field: "VEH_TP_NM",
    width: 70,
    pinned: "left",
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_VEHICLE_NUMBER",
    field: "VEH_NO",
    width: 90,
    pinned: "left",
    cellStyle: CENTER,
    editable: true,
  },
  {
    type: "text",
    headerName: "LBL_VEHICLE_TYPE",
    field: "VEH_TP_CD",
    width: 70,
    cellStyle: CENTER,
    codeKey: "fiStsList",
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_VEHICLE_TYPE",
    field: "VEH_TP_NM",
    colId: "VEH_TP_NM_COMBO",
    width: 70,
    cellStyle: CENTER,
    codeKey: "fiStsList",
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_DRIVER",
    field: "DRVR_NM",
    width: 70,
    pinned: "left",
    cellStyle: CENTER,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_PAY_CARRIER",
    field: "PAY_CARR_NM",
    width: 120,
    pinned: "left",
    editable: true,
  },
  {
    type: "text",
    headerName: "LBL_DSPCH_OP_TP",
    field: "DSPCH_OP_TP",
    width: 100,
    cellStyle: CENTER,
    codeKey: "dspchOpTpList",
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_WORK_TYPE_PLAN",
    field: "WORK_DAY_TP_PLN",
    width: 80,
    pinned: "left",
    cellStyle: CENTER,
    codeKey: "workTp",
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_WORK_TYPE_EXE",
    field: "WORK_DAY_TP_EXE",
    width: 80,
    pinned: "left",
    cellStyle: CENTER,
    codeKey: "workTpExe",
  },
  {
    type: "text",
    headerName: "LBL_CAL_TCD",
    field: "CAL_TCD",
    pinned: "left",
    codeKey: "calTcd",
  },
  {
    type: "text",
    headerName: "LBL_DLY_SETL_STS",
    field: "DLY_SETL_STS",
    pinned: "left",
    codeKey: "dlySetlSts",
  },
  {
    type: "text",
    headerName: "LBL_TTL_RTN_CNT",
    field: "TTL_RTN_CNT",
    width: 60,
    cellStyle: negativeRedRightCellStyle,
    headerClass: "font-bold",
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_FI_DIST_KM",
    field: "TTL_DIST",
    width: 90,
    cellStyle: negativeRedRightCellStyle,
    valueFormatter: numberValueFormatter,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_TTL_DIST",
    field: "TTL_DIST",
    colId: "TTL_DIST_2",
    width: 90,
    cellStyle: RIGHT,
    valueFormatter: numberValueFormatter,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_FLEX_QTY4",
    field: "TTL_DSPCH_WGT",
    width: 90,
    cellStyle: RIGHT,
    valueFormatter: numberValueFormatter,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_TTL_DSPCH_SALES_WGT",
    field: "TTL_DSPCH_SALES_WGT",
    width: 90,
    cellStyle: RIGHT,
    valueFormatter: numberValueFormatter,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_TTL_DSPCH_TRANSFER_WGT",
    field: "TTL_DSPCH_TRANSFER_WGT",
    width: 90,
    cellStyle: RIGHT,
    valueFormatter: numberValueFormatter,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_TTL_VOL",
    field: "TTL_DSPCH_VOL",
    width: 90,
    cellStyle: RIGHT,
    valueFormatter: numberValueFormatter,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_FLEX_QTY1",
    field: "TTL_DSPCH_FQ1",
    width: 90,
    cellStyle: RIGHT,
    valueFormatter: numberValueFormatter,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_FLEX_QTY2",
    field: "TTL_DSPCH_FQ2",
    width: 90,
    cellStyle: RIGHT,
    valueFormatter: numberValueFormatter,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_FLEX_QTY3",
    field: "TTL_DSPCH_FQ3",
    width: 90,
    cellStyle: RIGHT,
    valueFormatter: numberValueFormatter,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_TTL_ITEM_WGT",
    field: "TTL_DSPCH_FQ4",
    width: 90,
    cellStyle: RIGHT,
    valueFormatter: numberValueFormatter,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_FLEX_QTY5",
    field: "TTL_DSPCH_FQ5",
    width: 90,
    cellStyle: RIGHT,
    valueFormatter: numberValueFormatter,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_TTL_DSPCH_SALES_STOP_CNT",
    field: "TTL_DSPCH_SALES_STOP_CNT",
    width: 90,
    cellStyle: RIGHT,
    valueFormatter: numberValueFormatter,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_ACT_FUEL",
    field: "ACTUAL_FUEL_CNSMPTN",
    width: 90,
    cellStyle: RIGHT,
    valueFormatter: numberValueFormatter,
    editable: true,
  },
  {
    type: "text",
    headerName: "LBL_AP_MEMO",
    field: "MEMO_DESC",
    width: 120,
    editable: false,
  },
];

// ─────────────────────────────────────────────────────────────
// 메인 그리드 TAIL (ExtJS createColumns 공용 tail)
// ─────────────────────────────────────────────────────────────
export const DAILY_MAIN_TAIL = [
  {
    type: "text",
    headerName: "LBL_AP_ID",
    field: "DLY_APPLN_ID",
    cellStyle: CENTER,
  },
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// ─────────────────────────────────────────────────────────────
// 상세내역 그리드 — HEAD (ExtJS createSubHeaderColumns 대응)
// ─────────────────────────────────────────────────────────────
export const DAILY_DETAIL_HEAD = [
  { type: "text", headerName: "No", width: 40, pinned: "left" },
  {
    type: "text",
    headerName: "LBL_DLVRY_DATE",
    field: "DLVRY_DT",
    width: 80,
    pinned: "left",
    cellStyle: CENTER,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_VEHICLE_TYPE",
    field: "VEH_TP_NM",
    width: 70,
    pinned: "left",
    cellStyle: CENTER,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_VEH_NO",
    field: "VEH_NO",
    width: 100,
    pinned: "left",
    cellStyle: CENTER,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_DRIVER",
    field: "DRVR_NM",
    width: 100,
    pinned: "left",
    cellStyle: CENTER,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_PAY_CARRIER",
    field: "PAY_CARR_NM",
    width: 120,
    pinned: "left",
    editable: true,
  },
  {
    type: "text",
    headerName: "LBL_TRIP_COUNT",
    field: "RTN_NO",
    width: 60,
    pinned: "left",
    cellStyle: RIGHT,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_DISPATCH_NO",
    field: "DSPCH_NO",
    width: 120,
    pinned: "left",
    cellStyle: CENTER,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_DSPCH_OP_TP",
    field: "DSPCH_OP_TP",
    width: 100,
    cellStyle: CENTER,
    codeKey: "dspchOpTpList",
  },
  {
    type: "text",
    headerName: "LBL_VEHICLE_CODE",
    field: "VEH_ID",
    width: 150,
    cellStyle: CENTER,
    editable: false,
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_BATCH",
    field: "BATCH_NO",
    width: 50,
    cellStyle: CENTER,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_PLN_DSPCH_ROUTE",
    field: "DSPCH_LOC_DROP",
    width: 450,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_FI_LOC_DROP",
    field: "FI_LOC_DROP",
    width: 450,
    cellStyle: RIGHT,
    editable: false,
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_TRIP_YN",
    field: "TRIP_YN",
    width: 70,
    cellStyle: CENTER,
    editable: false,
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_APPROVED_ROTATION_COUNT",
    field: "APPROVAL_RTN_CNT",
    width: 100,
    cellStyle: RIGHT,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_DIST_KM",
    field: "TTL_DIST",
    width: 70,
    cellStyle: RIGHT,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_TRIP_NO",
    field: "TRIP_ID",
    width: 120,
    cellStyle: CENTER,
    editable: false,
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_TRIP_SEQ",
    field: "TRIP_SEQ",
    width: 120,
    cellStyle: RIGHT,
    editable: false,
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_FLEX_QTY4",
    field: "TTL_DSPCH_WGT",
    width: 90,
    cellStyle: RIGHT,
    valueFormatter: numberValueFormatter,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_TTL_DSPCH_SALES_WGT",
    field: "TTL_DSPCH_SALES_WGT",
    width: 90,
    cellStyle: RIGHT,
    valueFormatter: numberValueFormatter,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_TTL_DSPCH_TRANSFER_WGT",
    field: "TTL_DSPCH_TRANSFER_WGT",
    width: 90,
    cellStyle: RIGHT,
    valueFormatter: numberValueFormatter,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_TTL_VOL",
    field: "TTL_DSPCH_VOL",
    width: 90,
    cellStyle: RIGHT,
    valueFormatter: numberValueFormatter,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_FLEX_QTY1",
    field: "TTL_DSPCH_FQ1",
    width: 90,
    cellStyle: RIGHT,
    valueFormatter: numberValueFormatter,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_FLEX_QTY2",
    field: "TTL_DSPCH_FQ2",
    width: 90,
    cellStyle: RIGHT,
    valueFormatter: numberValueFormatter,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_FLEX_QTY3",
    field: "TTL_DSPCH_FQ3",
    width: 90,
    cellStyle: RIGHT,
    valueFormatter: numberValueFormatter,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_TTL_ITEM_WGT",
    field: "TTL_DSPCH_FQ4",
    width: 90,
    cellStyle: RIGHT,
    valueFormatter: numberValueFormatter,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_FLEX_QTY5",
    field: "TTL_DSPCH_FQ5",
    width: 90,
    cellStyle: RIGHT,
    valueFormatter: numberValueFormatter,
    editable: false,
  },
  {
    type: "text",
    headerName: "LBL_TTL_DSPCH_SALES_STOP_CNT",
    field: "TTL_DSPCH_SALES_STOP_CNT",
    width: 90,
    cellStyle: RIGHT,
    valueFormatter: numberValueFormatter,
    editable: false,
  },
];

export const DAILY_DETAIL_TAIL = [
  ...makeAuditColumns({
    delete: true,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
  }),
];

// ─────────────────────────────────────────────────────────────
// 초기 렌더용 (조회 전) — HEAD + TAIL
// ─────────────────────────────────────────────────────────────
export const DAILY_MAIN_COLUMN_DEFS = [...DAILY_MAIN_HEAD, ...DAILY_MAIN_TAIL];
export const DAILY_DETAIL_COLUMN_DEFS = [
  ...DAILY_DETAIL_HEAD,
  ...DAILY_DETAIL_TAIL,
];

// ─────────────────────────────────────────────────────────────
// 동적 body 컬럼 빌드 (ExtJS createColumns 의 BODY 부분 대응)
//   - USR_REG_CHG_RSN_REQD_YN == 'Y' → 그룹 (금액 + 사유)
//   - 그 외 → 단일 숫자 컬럼
//   - editable 규칙:
//       subGrid01(detail): 항상 non-editable
//       mainGrid: USR_REG_CHG_YN == 'Y' 만 editable
// ─────────────────────────────────────────────────────────────
type ChgMeta = {
  CHG_CD: string;
  CHG_NM: string;
  USR_REG_CHG_YN?: "Y" | "N";
  USR_REG_CHG_RSN_REQD_YN?: "Y" | "N";
};

export function buildDailyColumns(
  head: any[],
  tail: any[],
  chgList: ChgMeta[],
  opts: { isMainGrid: boolean },
): any[] {
  const { isMainGrid } = opts;

  const body = chgList.map((c) => {
    const editable = isMainGrid ? c.USR_REG_CHG_YN === "Y" : false;
    const rateField = c.CHG_CD;
    const reasonField = `${c.CHG_CD}_RSN_DESC`;

    if (c.USR_REG_CHG_RSN_REQD_YN === "Y") {
      return {
        headerName: c.CHG_NM,
        noLang: true,
        headerClass: "ag-header-center",
        children: [
          {
            type: "text",
            headerName: "LBL_RATE",
            field: rateField,
            width: 90,
            headerClass: "ag-header-center",
            editable,
            valueFormatter: numberValueFormatter,
            cellStyle: negativeRedCenterCellStyle,
            summable: true,
          },
          {
            type: "text",
            headerName: "LBL_REASON",
            field: reasonField,
            width: 90,
            headerClass: "ag-header-center",
            editable,
            cellStyle: CENTER,
          },
        ],
      };
    }

    return {
      type: "text",
      headerName: c.CHG_NM,
      noLang: true,
      field: rateField,
      width: 90,
      headerClass: "ag-header-center",
      editable,
      valueFormatter: numberValueFormatter,
      cellStyle: negativeRedCenterCellStyle,
      aggFunc: "sum",
      summable: true,
    };
  });

  return [...head, ...body, ...tail];
}
