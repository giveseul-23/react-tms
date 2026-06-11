import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { distanceTransitTimeApi as api } from "./DistanceTransitTimeApi";
import { MENU_CD } from "./DistanceTransitTime";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  DistanceTransitTimeModel,
  GridKey,
} from "./DistanceTransitTimeModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { usePopup } from "@/app/components/popup/PopupContext";
import { Lang } from "@/app/services/common/Lang";
import BaseTimePop from "./popup/BaseTimePop";
import RouteSearchOptionPop from "./popup/RouteSearchOptionPop";

interface Args {
  model: DistanceTransitTimeModel;
}

export function useDistanceTransitTimeController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  // 메인 클릭 → 추가 DTTO(sub) cascade
  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("main", row, [
        {
          to: "history",
          fetch: (r) =>
            api.getHistoryList({
              DIV_CD: r.DIV_CD,
              FRM_LOC_ID: r.FRM_LOC_ID,
              TO_LOC_ID: r.TO_LOC_ID,
            }),
        },
      ]),
    [base],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  // 선택(체크) 행 검증 — 서버 checkboxmodel MULTI 대응
  const requireSel = useCallback(
    (rows: any[]) => {
      if (!rows || rows.length === 0) {
        base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_ERR"));
        return false;
      }
      return true;
    },
    [base],
  );

  // 기준시각 팝업 → saveCalcDtto (isApplyStdDist: 표준거리 적용 여부)
  const openBaseTimePop = useCallback(
    (rows: any[], isApplyStdDist: "Y" | "N") => {
      openPopup({
        title: "LBL_DTTO_BASETIME_POPUP",
        width: "sm",
        content: (
          <BaseTimePop
            onConfirm={(baseTime) => {
              closePopup();
              const dsSave = rows.map((r) => ({
                ...r,
                IS_APPLY_STD_DISTANCE: isApplyStdDist,
                BASE_TIME: baseTime,
                MAP_NAME: "TMAP",
                EDIT_STS: "U",
              }));
              base
                .callAjax(api.saveCalcDtto({ dsSave }))
                .then(() => base.search());
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [openPopup, closePopup, base],
  );

  // 시간거리계산(표준거리적용) — 메인: confirm 2단계 후 기준시각 팝업
  const onCalcDtto = useCallback(
    (e?: any) => {
      const rows = e?.data ?? [];
      if (!requireSel(rows)) return;
      base.confirm(Lang.get("MSG_DEL_INPUT_DIST_CONFIRM"), () => {
        base.confirm(Lang.get("MSG_CONFIRM_UPD_TMAP_DISIT"), () =>
          openBaseTimePop(rows, "Y"),
        );
      });
    },
    [base, requireSel, openBaseTimePop],
  );

  // 시간거리계산(표준거리미적용) — 메인
  const onCalcDttoNs = useCallback(
    (e?: any) => {
      const rows = e?.data ?? [];
      if (!requireSel(rows)) return;
      openBaseTimePop(rows, "N");
    },
    [requireSel, openBaseTimePop],
  );

  // TMAP거리적용 — 선택행 DIST=TMAP_DIST 후 저장
  const onApplyTmapDist = useCallback(
    (e?: any) => {
      const rows = e?.data ?? [];
      if (!requireSel(rows)) return;
      const dsSave = rows.map((r: any) => ({
        ...r,
        DIST: r.TMAP_DIST,
        rowStatus: "U",
      }));
      base.callAjax(api.save({ dsSave })).then(() => base.search());
    },
    [base, requireSel],
  );

  // 경로탐색옵션 — 팝업 선택값을 선택행에 적용
  const onApplyRouteOption = useCallback(
    (e?: any) => {
      const rows = e?.data ?? [];
      if (!requireSel(rows)) return;
      openPopup({
        title: "BTN_ROUTE_SEARCH_OPTION",
        width: "sm",
        content: (
          <RouteSearchOptionPop
            onConfirm={(mapRtngOptnTcd) => {
              closePopup();
              const dsSave = rows.map((r: any) => ({
                ...r,
                MAP_RTNG_OPTN_TCD: mapRtngOptnTcd,
                IS_APPLY_STD_DISTANCE: "Y",
                EDIT_STS: "U",
              }));
              base
                .callAjax(api.saveMapSearchOption({ dsSave }))
                .then(() => base.search());
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [base, requireSel, openPopup, closePopup],
  );

  // 메인 행 추가 — 조회조건 디비전 자동 채움 (센차 SRCH_DIV_CD)
  const onAddMain = useCallback(() => {
    const f = (model.filtersRef.current ?? {}) as Record<string, any>;
    base.addRow("main", { DIV_CD: f.DIV_CD ?? "", DIV_NM: f.DIV_NM ?? "" });
  }, [base, model.filtersRef]);

  const onSaveMain = useCallback(
    () =>
      base.saveGrid("main", api.save, {
        confirmOnDelete: "삭제된 항목이 있습니다. 계속 진행하시겠습니까?",
      }),
    [base],
  );

  // 추가 DTTO(sub) 계산 — 선택행 기준시각 팝업
  const onCalcAddDtto = useCallback(
    (e?: any) => {
      const rows = e?.data ?? [];
      if (!requireSel(rows)) return;
      openBaseTimePop(rows, "Y");
    },
    [requireSel, openBaseTimePop],
  );

  const onCalcAddDttoNs = useCallback(
    (e?: any) => {
      const rows = e?.data ?? [];
      if (!requireSel(rows)) return;
      openBaseTimePop(rows, "N");
    },
    [requireSel, openBaseTimePop],
  );

  // 추가 DTTO(sub) 행 추가 — 선택 메인행 정보 채움
  const onAddSub = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!main) {
      base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_ERR"));
      return;
    }
    base.addRow("history", {
      DIV_CD: main.DIV_CD,
      LGST_GRP_CD: main.LGST_GRP_CD,
      FRM_LOC_ID: main.FRM_LOC_ID,
      TO_LOC_ID: main.TO_LOC_ID,
    });
  }, [base, model.grids.main]);

  const onSaveSub = useCallback(
    () =>
      base.saveGrid("history", api.saveAdd, {
        afterSave: {
          cascadeFrom: "main",
          fetch: (m) =>
            api.getHistoryList({
              DIV_CD: m.DIV_CD,
              FRM_LOC_ID: m.FRM_LOC_ID,
              TO_LOC_ID: m.TO_LOC_ID,
            }),
        },
      }),
    [base],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_CALC_DTTO",
        label: "BTN_CALC_DTTO",
        onClick: onCalcDtto,
      },
      {
        type: "button",
        key: "BTN_CALC_DTTO_NS",
        label: "BTN_CALC_DTTO_NS",
        onClick: onCalcDttoNs,
      },
      {
        type: "button",
        key: "BTN_APPLY_TMAP_DIST",
        label: "BTN_APPLY_TMAP_DIST",
        onClick: onApplyTmapDist,
      },
      {
        type: "button",
        key: "BTN_ROUTE_SEARCH_OPTION",
        label: "BTN_ROUTE_SEARCH_OPTION",
        onClick: onApplyRouteOption,
      },
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CD,
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
        upload: {
          gridId: "MAIN_GRID_DTTO_MGMT",
          onUploaded: () => base.search(),
        },
        templateDownload: { gridId: "MAIN_GRID_DTTO_MGMT" },
      }),
    ],
    [
      onCalcDtto,
      onCalcDttoNs,
      onApplyTmapDist,
      onApplyRouteOption,
      onAddMain,
      onSaveMain,
      menuName,
      model.grids.main,
      model.filtersRef,
      base,
    ],
  );

  const historyActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_CALC_DTTO",
        label: "BTN_CALC_DTTO",
        onClick: onCalcAddDtto,
      },
      {
        type: "button",
        key: "BTN_CALC_DTTO_NS",
        label: "BTN_CALC_DTTO_NS",
        onClick: onCalcAddDttoNs,
      },
      makeAddAction({ onClick: onAddSub }),
      makeSaveAction({ onClick: onSaveSub }),
    ],
    [onCalcAddDtto, onCalcAddDttoNs, onAddSub, onSaveSub],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    historyActions,
  };
}
