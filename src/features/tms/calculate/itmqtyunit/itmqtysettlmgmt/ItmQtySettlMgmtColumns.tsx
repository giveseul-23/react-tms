// 그리드 컬럼 정의 (서버 ItmQtySettlMgmtMain/Sub01/Sub02 기준)
// audit 컬럼(등록자/등록일시/수정자/수정일시)은 DataGrid 가 자동 추가(model.bind) — 서버 CRE/UPD 컬럼은 OMIT.

import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { itmQtySettlMgmtApi as api } from "./ItmQtySettlMgmtApi";

// 소수 1자리 합계/표기 (서버 summaryRenderer: toFixed(1) + 천단위 콤마 대응)
const decimalFormatter = (p: any) => {
  const n = Number(String(p?.value ?? "").replace(/,/g, "")) || 0;
  const v = n > 0 && !Number.isInteger(n) ? n.toFixed(1) : n;
  return Number(v).toLocaleString();
};

// ── 메인: 물동량(협력사단위) — 읽기전용 + 합계행 ────────────────────
export const MAIN_COLUMN_DEFS = [
  { type: "text", headerName: "LBL_AP_SETL_ID", field: "AP_SETL_ID", hide: true },
  { type: "text", headerName: "VOLUME_AP_AUTO_CONFIRM", field: "VOLUME_AP_AUTO_CONFIRM", hide: true, noLang: true },
  { headerName: "No" },
  { type: "text", headerName: "LBL_AP_DOC_ID", field: "AP_ID", align: "center", width: 100 },
  { type: "combo", headerName: "LBL_PRCS_STS", field: "AP_FI_STS", statusStyle: "AP_FI_STS", codeKey: "apFiSts", align: "center", width: 70 },
  { type: "text", headerName: "LBL_PAY_CARRIER_CODE", field: "PAY_CARR_CD", align: "center", width: 120 },
  { type: "text", headerName: "LBL_PAY_CARRIER_NAME", field: "PAY_CARR_NM", width: 120 },
  { type: "combo", headerName: "LBL_DLY_SETL_STS", field: "DLY_SETL_STS", codeKey: "dlySetlSts", align: "center", width: 100 },
  { type: "text", headerName: "LBL_TARIFF_UOM_CD", field: "ITEM_CD", align: "center", width: 100 },
  { type: "text", headerName: "LBL_TARIFF_UOM_NM", field: "ITEM_NM", width: 100 },
  { type: "numeric", headerName: "LBL_CONFIRMED_QTY", field: "CFM_QTY", summaryType: "sum", width: 100 },
  { type: "numeric", headerName: "LBL_TOTAL_INS_COST", field: "TTL_PLN_RATE", summaryType: "sum", width: 100, valueFormatter: decimalFormatter },
  { type: "numeric", headerName: "LBL_TOTAL_ADJ_COST", field: "TTL_CFM_RATE", summaryType: "sum", width: 100, valueFormatter: decimalFormatter },
  { type: "date", headerName: "LBL_FROM_DTTM", field: "FRM_DTTM", align: "center", width: 80 },
  { type: "date", headerName: "LBL_TO_DTTM", field: "TO_DTTM", align: "center", width: 80 },
  { type: "text", headerName: "LBL_AP_MEMO", field: "MEMO_DESC", width: 120 },
];

// ── sub01: 요율항목 (요율항목코드 추가/확정금액·사유 편집) ───────────
export const SUB01_COLUMN_DEFS = [
  { type: "text", headerName: "AP_ID", field: "AP_ID", hide: true, noLang: true },
  { type: "text", headerName: "AP_FI_STS", field: "AP_FI_STS", hide: true, noLang: true },
  { headerName: "No" },
  {
    type: "popuser",
    headerName: "LBL_RATE_ITEM_CD",
    field: "CHG_CD",
    align: "center",
    width: 90,
    insertable: true,
    editable: false,
    renderPopup: ({ commit, close, row }: any) => (
      <CommonPopup
        fetchFn={(extra?: any) =>
          api.searchPopChgList({ AP_ID: row?.AP_ID, ...extra })
        }
        onApply={(picked: any) => {
          commit({ CHG_CD: picked.CODE, CHG_NM: picked.NAME });
          close();
        }}
        onClose={close}
      />
    ),
  },
  { type: "text", headerName: "LBL_RATE_ITEM_NM", field: "CHG_NM", insertable: true, editable: true, width: 90 },
  { type: "numeric", headerName: "LBL_INS_COST", field: "PLN_RATE", summaryType: "sum", width: 100, valueFormatter: decimalFormatter },
  { type: "numeric", headerName: "LBL_CONFIRM_COST", field: "CFM_RATE", insertable: true, editable: true, summaryType: "sum", width: 100, valueFormatter: decimalFormatter },
  { type: "text", headerName: "LBL_REASON", field: "RSN_DESC", insertable: true, editable: true, width: 200 },
  // TODO: 증빙첨부(FILE_NM) — 서버 popuser(DspchOperCostFileEditPop) 파일 편집 팝업. React 미구현, 표시 전용.
  { type: "text", headerName: "LBL_ATTACH_FILE", field: "FILE_NM", width: 150 },
  { type: "combo", headerName: "LBL_CAL_TCD", field: "CAL_TCD", codeKey: "calTcd", width: 120 },
];

// ── sub02: 구간상세 (수량조정값만 편집) ────────────────────────────
export const SUB02_COLUMN_DEFS = [
  { type: "text", headerName: "LANE_ID", field: "LANE_ID", hide: true, noLang: true },
  { type: "text", headerName: "CHG_CD", field: "CHG_CD", hide: true, noLang: true },
  { type: "text", headerName: "AP_ID", field: "AP_ID", hide: true, noLang: true },
  { type: "text", headerName: "LGST_GRP_CD", field: "LGST_GRP_CD", hide: true, noLang: true },
  { type: "text", headerName: "DIV_CD", field: "DIV_CD", hide: true, noLang: true },
  { type: "text", headerName: "LBL_FROM_ZN_CD", field: "FROM_ZN_NM", align: "center", width: 70 },
  { type: "text", headerName: "LBL_TO_ZN_CD", field: "TO_ZN_NM", align: "center", width: 70 },
  { type: "numeric", headerName: "LBL_OUTPUT_COST_VAL", field: "CFM_QTY", width: 70 },
  { type: "numeric", headerName: "LBL_ADJ_COST_VAL", field: "ADJ_CLSS_CD_VAL", editable: true, insertable: true, width: 70 },
  { type: "numeric", headerName: "LBL_UNIT_COST", field: "RATE", summaryType: "sum", width: 80, valueFormatter: decimalFormatter },
  { type: "numeric", headerName: "LBL_INS_COST", field: "PLN_RATE", width: 90, valueFormatter: decimalFormatter },
  { type: "text", headerName: "LBL_COND_CLSS_CD", field: "COND_CLSS_CD", width: 120 },
  { type: "text", headerName: "LBL_COND_CLSS_CD_VAL", field: "COND_CLSS_CD_VAL", align: "center", width: 120 },
];
