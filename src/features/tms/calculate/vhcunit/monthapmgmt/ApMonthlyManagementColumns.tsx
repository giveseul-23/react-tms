import { makeAuditColumns } from "@/app/components/grid/commonColumns";
import {
  CENTER,
  RIGHT,
  numberValueFormatter,
  negativeRedCenterCellStyle,
  negativeRedRightCellStyle,
} from "@/app/components/grid/commonFormatters";

// ─────────────────────────────────────────────────────────────
// 월실적 (메인) — HEAD (ExtJS createMainHeaderColumns 대응)
// ─────────────────────────────────────────────────────────────
export const MONTHLY_MAIN_HEAD = [
  { headerName: "No", width: 40, cellStyle: RIGHT, pinned: "left" },
  { field: "DIV_CD", hide: true },
  { field: "LGST_GRP_CD", hide: true },
  {
    headerName: "LBL_AP_ID",
    field: "AP_ID",
    width: 70,
    pinned: "left",
    cellStyle: CENTER,
    editable: false,
  },
  {
    headerName: "LBL_DEAD_LINE",
    field: "TO_DTTM",
    width: 80,
    pinned: "left",
    cellStyle: CENTER,
    editable: false,
  },
  {
    headerName: "LBL_FINANCIAL_STATUS",
    field: "AP_FI_STS",
    width: 100,
    pinned: "left",
    cellStyle: CENTER,
    codeKey: "fiStsList",
    editable: false,
    // TODO: setApFinancialStatusColor 포팅
  },
  { field: "VEH_ID", hide: true, pinned: "left" },
  {
    headerName: "LBL_VEHICLE_NUMBER",
    field: "VEH_NO",
    width: 100,
    pinned: "left",
    cellStyle: CENTER,
    editable: false,
  },
  {
    headerName: "LBL_VEHICLE_TYPE",
    field: "VEH_TP_NM",
    width: 100,
    pinned: "left",
    cellStyle: CENTER,
    editable: false,
  },
  {
    headerName: "LBL_DRIVER_NAME",
    field: "DRVR_NM",
    width: 70,
    pinned: "left",
    cellStyle: CENTER,
    editable: false,
  },
  {
    headerName: "LBL_REAL_RTN_CNT",
    field: "TTL_RTN_CNT",
    width: 100,
    cellStyle: negativeRedRightCellStyle,
    editable: false,
  },
  {
    headerName: "LBL_FI_DIST_KM",
    field: "TTL_FI_DIST",
    width: 100,
    cellStyle: negativeRedRightCellStyle,
    valueFormatter: numberValueFormatter,
    editable: false,
  },
];

// ─────────────────────────────────────────────────────────────
// 월실적 — TAIL (ExtJS createColumns tail 대응)
// ─────────────────────────────────────────────────────────────
export const MONTHLY_MAIN_TAIL = [
  {
    headerName: "LBL_DISPATCH_RATE_CD",
    field: "TRF_CD",
    width: 200,
    cellStyle: CENTER,
    editable: false,
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
// 초기 렌더용 (조회 전) — HEAD + TAIL
// ─────────────────────────────────────────────────────────────
export const MAIN_COLUMN_DEFS = [...MONTHLY_MAIN_HEAD, ...MONTHLY_MAIN_TAIL];

// ─────────────────────────────────────────────────────────────
// 동적 body 컬럼 빌드 (ExtJS createColumns BODY 대응)
//   - USR_REG_CHG_RSN_REQD_YN == 'Y' → 그룹 (금액 + 사유)
//   - 그 외 → 단일 숫자 컬럼
//   - editable 규칙 (Daily 와 다름):
//       disabled = (DF_CHG_OP_DIV_TCD !== 'MONTHLY') || (USR_REG_CHG_YN === 'N')
//       즉 편집 가능 = DF_CHG_OP_DIV_TCD === 'MONTHLY' && USR_REG_CHG_YN === 'Y'
// ─────────────────────────────────────────────────────────────
type ChgMeta = {
  CHG_CD: string;
  CHG_NM: string;
  DF_CHG_OP_DIV_TCD?: string;
  USR_REG_CHG_YN?: "Y" | "N";
  USR_REG_CHG_RSN_REQD_YN?: "Y" | "N";
};

export function buildMonthlyColumns(
  head: any[],
  tail: any[],
  chgList: ChgMeta[],
): any[] {
  const body = chgList.map((c) => {
    const editable =
      c.DF_CHG_OP_DIV_TCD === "MONTHLY" && c.USR_REG_CHG_YN === "Y";
    const rateField = c.CHG_CD;
    const reasonField = `${c.CHG_CD}_RSN_DESC`;

    if (c.USR_REG_CHG_RSN_REQD_YN === "Y") {
      return {
        headerName: c.CHG_NM,
        noLang: true,
        headerClass: "ag-header-center",
        children: [
          {
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
      headerName: c.CHG_NM,
      noLang: true,
      field: rateField,
      width: 90,
      headerClass: "ag-header-center",
      editable,
      valueFormatter: numberValueFormatter,
      cellStyle: negativeRedCenterCellStyle,
      summable: true,
    };
  });

  return [...head, ...body, ...tail];
}
