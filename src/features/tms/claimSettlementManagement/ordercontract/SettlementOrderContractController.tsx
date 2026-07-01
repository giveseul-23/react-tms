import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { toDsSave } from "@/app/components/grid/gridUtils/rowStatus";
import { ROW_STATUS } from "@/app/components/grid/gridCommon";
import { Lang } from "@/app/services/common/Lang";
import { settlementOrderContractApi as api } from "./SettlementOrderContractApi";
import { MENU_CODE } from "./SettlementOrderContract";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { SettlementOrderContractModel, GridKey } from "./SettlementOrderContractModel";
import type { ComboSearchMeta, SearchMeta } from "@/features/search/search.meta.types";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: SettlementOrderContractModel;
}

// rawFiltersRef — SRCH_* / DBCOLUMN 키 후보에서 첫 유효값
const pick = (raw: Record<string, any>, ...keys: string[]): string => {
  for (const k of keys) {
    const v = raw?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "")
      return String(v).trim();
  }
  return "";
};

const toYmd = (v: unknown) => String(v ?? "").replace(/\D/g, "").slice(0, 8);

const resolveComboName = (
  meta: readonly SearchMeta[],
  keyParam: string,
  code: string,
): string => {
  if (!code) return "";
  const field = meta.find(
    (m): m is ComboSearchMeta =>
      m.type === "COMBO" &&
      (m.keyParam === keyParam || m.key === keyParam || m.key.endsWith(`_${keyParam}`)),
  );
  const name = field?.options?.find((opt) => opt.CODE === code)?.NAME;
  return name ? String(name) : code;
};

// resultSaveAR — 서버 msg(HTML 포함)를 센차 record.msg 처럼 표시
const stripHtmlTags = (s: string) =>
  s
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();

const resolveArSaveResultMessage = (res: any) => {
  const serverMsg = res?.data?.msg;
  if (serverMsg != null && String(serverMsg).trim() !== "") {
    return stripHtmlTags(String(serverMsg));
  }
  return Lang.get("MSG_SAVE_CMPLT");
};

export function useSettlementOrderContractController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  // 조회조건 raw 값 (SearchMeta 필드 id = 센차 comp 이름)
  const getSearch = useCallback(
    () => (model.rawFiltersRef.current ?? {}) as Record<string, any>,
    [model.rawFiltersRef],
  );

  const getSearchConditionValue = useCallback(() => {
    const s = getSearch();
    const arTrfLcd = pick(s, "SRCH_AR_TRF_LCD", "AR_TRF_LCD");
    const arStlBaseDtTp = pick(s, "SRCH_AR_STL_BASE_DT_TP", "AR_STL_BASE_DT_TP");
    return {
      DIV_CD: pick(s, "SRCH_SHPM_DIV_CD", "SHPM_DIV_CD"),
      DIV_NM: pick(s, "SRCH_SHPM_DIV_NM", "SHPM_DIV_NM", "SHPM_DIV__NM"),
      LGST_GRP_CD: pick(s, "SRCH_SHPM_LGST_GRP_CD", "SHPM_LGST_GRP_CD"),
      LGST_GRP_NM: pick(s, "SRCH_SHPM_LGST_GRP_NM", "SHPM_LGST_GRP_NM", "SHPM_LGST_GRP__NM"),
      AR_TRF_LCD: arTrfLcd,
      AR_TRF_LNM:
        pick(s, "SRCH_AR_TRF_LCD_NM", "AR_TRF_LNM") ||
        resolveComboName(model.searchMeta, "AR_TRF_LCD", arTrfLcd) ||
        resolveComboName(model.searchMeta, "AR_CNTRCT_LCD", arTrfLcd),
      CUST_CD: pick(s, "SRCH_SHPM_CUST_CD", "SHPM_CUST_CD"),
      CUST_NM: pick(s, "SRCH_SHPM_CUST_NM", "SHPM_CUST_NM", "SHPM_CUST__NM"),
      AR_CNTRCT_CD: pick(s, "SRCH_AR_CNTRCT_CD", "AR_CNTRCT_CD"),
      AR_CNTRCT_NM: pick(s, "SRCH_AR_CNTRCT_NM", "AR_CNTRCT_NM", "AR_CNTRCT__NM"),
      AR_STL_BASE_DT_TP: arStlBaseDtTp,
      AR_STL_BASE_DT_NM:
        pick(s, "SRCH_AR_STL_BASE_DT_TP_NM", "AR_STL_BASE_DT_NM") ||
        resolveComboName(model.searchMeta, "AR_STL_BASE_DT_TP", arStlBaseDtTp),
      AR_DATE_FROM: toYmd(pick(s, "SRCH_AR_DATE_FRM", "SRCH_AR_DATE_FROM", "AR_DATE_FROM")),
      AR_DATE_TO: toYmd(pick(s, "SRCH_AR_DATE_TO", "AR_DATE_TO")),
      MENU_CD: MENU_CODE,
    };
  }, [getSearch, model.searchMeta]);

  // 서버 validSearchCondition — 필수 조회조건 + 계약단위면 매출계약코드 필수
  const validSearchCondition = useCallback(() => {
    const v = getSearchConditionValue();
    if (
      !v.DIV_CD ||
      !v.LGST_GRP_CD ||
      !v.AR_TRF_LCD ||
      !v.CUST_CD ||
      !v.AR_STL_BASE_DT_TP ||
      !v.AR_DATE_FROM ||
      !v.AR_DATE_TO
    ) {
      return false;
    }
    // 계약단위인데 매출계약코드 미선택
    if (v.AR_TRF_LCD === "CONTRACT" && !v.AR_CNTRCT_CD) return false;
    return true;
  }, [getSearchConditionValue]);

  // 센차 getConfirmMessage
  const getConfirmMessage = useCallback(() => {
    const v = getSearchConditionValue();
    const lines = [
      `${Lang.get("LBL_DIV")}: ${v.DIV_NM || v.DIV_CD} (${v.DIV_CD})`,
      `${Lang.get("LBL_LOGISTICS_GROUP")}: ${v.LGST_GRP_NM || v.LGST_GRP_CD} (${v.LGST_GRP_CD})`,
      `${Lang.get("LBL_ACCOUNTS_RECEIVABLE_TARIFF_LEVEL_CODE")}: ${v.AR_TRF_LNM}`,
      `${Lang.get("LBL_CUSTOMER")}: ${v.CUST_NM || v.CUST_CD} (${v.CUST_CD})`,
    ];
    if (v.AR_TRF_LCD === "CONTRACT") {
      lines.push(
        `${Lang.get("LBL_ACCOUNTS_RECEIVABLE_TARIFF_CODE")}: ${v.AR_CNTRCT_NM || v.AR_CNTRCT_CD} (${v.AR_CNTRCT_CD})`,
      );
    }
    lines.push(
      `${Lang.get("LBL_APPLY_TERM")}: (${v.AR_STL_BASE_DT_NM}) ${v.AR_DATE_FROM} ~ ${v.AR_DATE_TO}`,
      "",
      Lang.get("MSG_CHECK_CONDITION"),
    );
    return lines.join("\n");
  }, [getSearchConditionValue]);

  // ── 조회 ──────────────────────────────────────────────────────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onSearchCallback = useCallback(
    (data: any) => model.grids.main.setData(data),
    [model.grids.main],
  );

  // 정산문서 생성 — resultSaveAR msg 표시 (공통 callAjax 미사용)
  const runCreateSettlement = useCallback(
    async (apiCall: Promise<any>) => {
      model.setGridMasking(["main"], true);
      try {
        const res = await apiCall;
        if (res?.data?.success === false) {
          base.alert(String(res.data?.msg ?? Lang.get("TTL_ERR")));
          return;
        }
        base.alert(resolveArSaveResultMessage(res));
        base.search();
      } catch (err: any) {
        const message =
          err?.response?.data?.msg ??
          err?.response?.data?.error?.message ??
          String(err?.message ?? err);
        base.alert(message);
      } finally {
        model.setGridMasking(["main"], false);
      }
    },
    [base, model],
  );

  // ── 주문별 정산문서 생성 (선택 행 단위) ───────────────────────────
  const onCreateSettlementPerShipment = useCallback(
    ({ data }: { data: any[] }) => {
      const selected = data ?? [];
      if (!selected.length) {
        base.alert(Lang.get("MSG_SELECT_NO_DATA"));
        return;
      }
      const dsSave = toDsSave(
        selected.map((row) => ({
          ...row,
          AR_CALC_TCD: "SHPM",
          EDIT_STS: ROW_STATUS.UPDATE,
        })),
      );
      void runCreateSettlement(api.createSettlementPerShipment({ dsSave }));
    },
    [runCreateSettlement],
  );

  // ── 기간합산 정산문서 생성 ─────────────────────────────────────────
  // 선택 행이 없으면 조회조건 검증 후 confirm → 조건단위 생성,
  // 선택 행이 있으면 선택 행 단위 생성.
  const onCreateSettlementAggByPeriod = useCallback(
    ({ data }: { data: any[] }) => {
      const selected = data ?? [];

      if (!selected.length) {
        if (!validSearchCondition()) {
          base.alert(Lang.get("MSG_CHECK_SEARCH_CONDITION"));
          return;
        }
        base.confirm(getConfirmMessage(), () => {
          const params = getSearchConditionValue();
          void runCreateSettlement(
            api.createSettlementPerPeriodByCondition({
              ...params,
              AR_CALC_TCD: "PERIOD",
            }),
          );
        });
        return;
      }

      const dsSave = toDsSave(
        selected.map((row) => ({
          ...row,
          AR_CALC_TCD: "PERIOD",
          EDIT_STS: ROW_STATUS.UPDATE,
        })),
      );
      void runCreateSettlement(api.createSettlementPerPeriodBySelection({ dsSave }));
    },
    [base, getConfirmMessage, getSearchConditionValue, runCreateSettlement, validSearchCondition],
  );

  // ── 그리드 액션 ────────────────────────────────────────────────────
  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_CREATE_SETTLEMENT_PER_ORDER",
        label: "BTN_CREATE_SETTLEMENT_PER_ORDER",
        onClick: onCreateSettlementPerShipment,
      },
      {
        type: "button",
        key: "BTN_CREATE_SETTLEMENT_AGG_BY_PERIOD",
        label: "BTN_CREATE_SETTLEMENT_AGG_BY_PERIOD",
        onClick: onCreateSettlementAggByPeriod,
      },
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: () => model.grids.main.rows,
      }),
    ],
    [
      menuName,
      model.grids.main,
      model.filtersRef,
      onCreateSettlementPerShipment,
      onCreateSettlementAggByPeriod,
    ],
  );

  return {
    fetchList,
    onSearchCallback,
    mainActions,
  };
}
