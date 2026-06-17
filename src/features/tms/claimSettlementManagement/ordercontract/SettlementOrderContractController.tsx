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
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: SettlementOrderContractModel;
}

export function useSettlementOrderContractController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  // 조회조건 raw 값 (SearchMeta 필드 id = 센차 comp 이름)
  const getSearch = useCallback(
    () => (model.rawFiltersRef.current ?? {}) as Record<string, any>,
    [model.rawFiltersRef],
  );

  // ── 조회 ──────────────────────────────────────────────────────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onSearchCallback = useCallback(
    (data: any) => model.grids.main.setData(data),
    [model.grids.main],
  );

  // 서버 validSearchCondition — 필수 조회조건 + 계약단위면 매출계약코드 필수
  const validSearchCondition = useCallback(() => {
    const s = getSearch();
    const tariffLevel = s.SRCH_AR_TRF_LCD;
    if (
      !s.SRCH_SHPM_DIV_CD ||
      !s.SRCH_SHPM_LGST_GRP_CD ||
      !tariffLevel ||
      !s.SRCH_SHPM_CUST_CD ||
      !s.SRCH_AR_STL_BASE_DT_TP ||
      !s.SRCH_AR_DATE_FROM ||
      !s.SRCH_AR_DATE_TO
    ) {
      return false;
    }
    // 계약단위인데 매출계약코드 미선택
    if (tariffLevel === "CONTRACT" && !s.SRCH_AR_CNTRCT_CD) return false;
    return true;
  }, [getSearch]);

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
      void base
        .callAjax(api.createSettlementPerShipment({ dsSave }))
        .then(() => base.search());
    },
    [base],
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
        const s = getSearch();
        // 서버 getConfirmMessage 는 조회조건 표시명(DIV_NM 등)으로 메시지를 조립한다.
        // SearchMeta raw 값에는 표시명이 없어 코드값 기준 + 확인 안내로 대체.
        // TODO: 조회조건 표시명(고객사명/물류그룹명 등) 노출이 필요하면 메타에서 라벨 조회 추가.
        base.confirm(Lang.get("MSG_CHECK_CONDITION"), () => {
          const params = {
            DIV_CD: s.SRCH_SHPM_DIV_CD ?? "",
            LGST_GRP_CD: s.SRCH_SHPM_LGST_GRP_CD ?? "",
            AR_TRF_LCD: s.SRCH_AR_TRF_LCD ?? "",
            CUST_CD: s.SRCH_SHPM_CUST_CD ?? "",
            AR_CNTRCT_CD: s.SRCH_AR_CNTRCT_CD ?? "",
            AR_STL_BASE_DT_TP: s.SRCH_AR_STL_BASE_DT_TP ?? "",
            AR_DATE_FROM: s.SRCH_AR_DATE_FROM ?? "",
            AR_DATE_TO: s.SRCH_AR_DATE_TO ?? "",
            AR_CALC_TCD: "PERIOD",
          };
          void base
            .callAjax(api.createSettlementPerPeriodByCondition(params))
            .then(() => base.search());
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
      void base
        .callAjax(api.createSettlementPerPeriodBySelection({ dsSave }))
        .then(() => base.search());
    },
    [base, getSearch, validSearchCondition],
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
        rows: model.grids.main.rows,
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
