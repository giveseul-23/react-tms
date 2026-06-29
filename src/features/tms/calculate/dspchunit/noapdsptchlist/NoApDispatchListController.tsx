import { useCallback, useMemo, useRef } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { usePopup } from "@/app/components/popup/PopupContext";
import { Lang } from "@/app/services/common/Lang";
import { noApDispatchListApi as api } from "./NoApDispatchListApi";
import { MENU_CODE, AUTH } from "./NoApDispatchList";
import { MAIN_HEAD, MAIN_TAIL, buildNoApColumns } from "./NoApDispatchListColumns";
import { NoApDispatchListPop } from "./popup/NoApDispatchListPop";
import { PayCarrChgPop } from "./popup/PayCarrChgPop";
import { SameRtnDspchMergePop } from "./popup/SameRtnDspchMergePop";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { NoApDispatchListModel, GridKey } from "./NoApDispatchListModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: NoApDispatchListModel;
}

export function useNoApDispatchListController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();

  // 조회조건 raw 값 (SearchMeta 필드 id = 센차 comp 이름)
  const getSearch = useCallback(
    () => (model.rawFiltersRef.current ?? {}) as Record<string, any>,
    [model.rawFiltersRef],
  );

  // 동적 요율항목 컬럼 — 1회 조회 후 캐시 (서버 getChgList: MENU_PLAN_TENDER_RECEIVE 고정 params)
  const chgFetchedRef = useRef(false);

  const fetchList = useCallback(
    async (params: Record<string, unknown>) => {
      if (!chgFetchedRef.current) {
        try {
          const chgRes: any = await api.getCarrierChgList();
          const chgList =
            chgRes?.data?.result ?? chgRes?.data?.data?.dsOut ?? [];
          model.setMainColumnDefs(
            buildNoApColumns(MAIN_HEAD, MAIN_TAIL, chgList),
          );
          chgFetchedRef.current = true;
        } catch (err) {
          console.error("searchCarrierChgList failed", err);
        }
      }
      // 서버 onActionAfterSearch: TO_LOC_NM 은 검색영역 제외 후 별도 param 으로 합침
      const s = getSearch();
      return api.getList({ TO_LOC_NM: s.SRCH_TO_LOC_NM ?? "", ...params });
    },
    [getSearch, model],
  );

  const onMainGridClick = useCallback(
    (row: any) => base.handleRowClick("main", row),
    [base],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  // 선택행 검증 — 비어있으면 안내 후 false
  const requireSelected = useCallback(
    (rows: any[], msg = "MSG_SELECT_NO_DATA") => {
      if (!rows || rows.length === 0) {
        base.alert(Lang.get(msg));
        return false;
      }
      return true;
    },
    [base],
  );

  // ── 지급운송협력사 > 재설정 (saveDspchPayCarrReSet) ───────────────
  const onDspchPayCarrReSet = useCallback(
    ({ data }: { data: any[] }) => {
      if (!requireSelected(data, "MSG_PAY_CARR_DSPCH_SELECT")) return;
      base.confirm(Lang.get("MSG_CHANGE_TO_VEH_PAY_CARR_CONFIRM"), () => {
        void base
          .callAjax(api.saveDspchPayCarrReSet(data), { mask: "main" })
          .then(() => base.search());
      });
    },
    [base, requireSelected],
  );

  // ── 지급운송협력사 > 변경 (PayCarrChgPop) ─────────────────────────
  const onPayCarrChange = useCallback(
    ({ data }: { data: any[] }) => {
      if (!requireSelected(data, "MSG_PAY_CARR_DSPCH_SELECT")) return;
      const s = getSearch();
      openPopup({
        title: "LBL_PAY_CARRIER",
        width: "2xl",
        content: (
          <PayCarrChgPop
            initialValues={{
              DIV_CD: s.SRCH_PD_DIV_CD ?? "",
              LGST_GRP_CD: s.SRCH_PD_PAY_LGST_GRP_CD ?? "",
            }}
            onConfirm={(payload) => {
              closePopup();
              const rows = data.map((r) => ({
                ...r,
                PAY_CARR_CD: payload.PAY_CARR_CD,
                PAY_CARR_NM: payload.PAY_CARR_NM,
              }));
              void base
                .callAjax(api.saveDspchPayCarrChange(rows), { mask: "main" })
                .then(() => base.search());
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [base, closePopup, getSearch, openPopup, requireSelected],
  );

  // ── 동일회전배차합산 (SameRtnDspchMergePop) ───────────────────────
  const onSameRtnDspchMerge = useCallback(() => {
    const s = getSearch();
    openPopup({
      title: "LBL_SAME_RTN_DSPCH_MERGE",
      width: "4xl",
      content: (
        <SameRtnDspchMergePop
          searchCond={{
            DIV_CD: s.SRCH_PD_DIV_CD ?? "",
            LGST_GRP_CD: s.SRCH_PD_PAY_LGST_GRP_CD ?? "",
            DLVRY_DT_FROM: s.SRCH_PD_DLVRY_DT_FROM ?? "",
            DLVRY_DT_TO: s.SRCH_PD_DLVRY_DT_TO ?? "",
            PAY_CARR_CD: s.SRCH_PD_PAY_CARR_CD ?? "",
            VEH_NO: s.SRCH_VEH_NO ?? "",
          }}
          onDone={() => base.search()}
          onClose={closePopup}
        />
      ),
    });
  }, [base, closePopup, getSearch, openPopup]);

  // ── RATESHOP (changeRate → NoApDispatchListPop) ──────────────────
  const onChangeRate = useCallback(
    ({ data }: { data: any[] }) => {
      if (!requireSelected(data)) return;
      openPopup({
        title: "BTN_RATESHOP",
        width: "2xl",
        content: (
          <NoApDispatchListPop
            dspchNo={data[0]?.DSPCH_NO ?? ""}
            onDone={() => base.search()}
            onClose={closePopup}
          />
        ),
      });
    },
    [base, closePopup, openPopup, requireSelected],
  );

  // ── RATING (ratingRefactor → makeRateRefactor) ───────────────────
  const onRatingRefactor = useCallback(
    ({ data }: { data: any[] }) => {
      if (!requireSelected(data)) return;
      const s = getSearch();
      if (!s.SRCH_PD_DIV_CD) {
        base.alert(Lang.get("MSG_SEL_DIV"));
        return;
      }
      if (!s.SRCH_PD_PAY_LGST_GRP_CD) {
        base.alert(Lang.get("MSG_SEL_LGST_GRP"));
        return;
      }
      if (!s.SRCH_PD_DLVRY_DT_FROM || !s.SRCH_PD_DLVRY_DT_TO) {
        base.alert(Lang.get("MSG_CHECK_SEARCH_CONDITION"));
        return;
      }
      void base
        .callAjax(
          api.makeRateRefactor(data, {
            DIV_CD: s.SRCH_PD_DIV_CD,
            LGST_GRP_CD: s.SRCH_PD_PAY_LGST_GRP_CD,
            DLVRY_DT_FROM: s.SRCH_PD_DLVRY_DT_FROM,
            DLVRY_DT_TO: s.SRCH_PD_DLVRY_DT_TO,
          }),
          { mask: "main" },
        )
        .then(() => base.search());
    },
    [base, getSearch, requireSelected],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "dropdown",
        key: "LBL_PAY_CARRIER",
        label: "LBL_PAY_CARRIER",
        items: [
          {
            type: "button",
            key: "BTN_RE_SET",
            label: "BTN_RE_SET",
            onClick: onDspchPayCarrReSet,
          },
          {
            type: "button",
            key: "BTN_CHANGE",
            label: "BTN_CHANGE",
            onClick: onPayCarrChange,
          },
        ],
      },
      {
        type: "button",
        key: "LBL_SAME_RTN_DSPCH_MERGE",
        label: "LBL_SAME_RTN_DSPCH_MERGE",
        onClick: onSameRtnDspchMerge,
      },
      {
        type: "button",
        key: "BTN_RATESHOP",
        label: "BTN_RATESHOP",
        authCls: "BTN_RATESHOP_MAIN_GRID_NO_AP_DSPCH",
        onClick: onChangeRate,
      },
      {
        type: "button",
        key: "BTN_RATING",
        label: "BTN_RATING",
        onClick: onRatingRefactor,
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
      model.filtersRef,
      model.grids.main,
      onChangeRate,
      onDspchPayCarrReSet,
      onPayCarrChange,
      onRatingRefactor,
      onSameRtnDspchMerge,
    ],
  );

  // NOTE: AUTH 단일 소스(엑셀 업로드/양식이 추가될 경우 gridId: AUTH.grids.main).
  void AUTH;

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
  };
}
