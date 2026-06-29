import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { usePopup } from "@/app/components/popup/PopupContext";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { Lang } from "@/app/services/common/Lang";
import { oilPriceByDayApi as api } from "./OilPriceByDayApi";
import { MENU_CODE } from "./OilPriceByDay";
import {
  OilPriceTrendPop,
  type TrendLevel,
} from "./popup/OilPriceTrendPop";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { OilPriceByDayModel, GridKey } from "./OilPriceByDayModel";

interface Args {
  model: OilPriceByDayModel;
}

export function useOilPriceByDayController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup } = usePopup();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  // sub01 조회 (서버 onMainGridClick → sub01Grid.search)
  const loadSido = useCallback(
    (row: any) => {
      const filters = model.filtersRef.current ?? {};
      return api.getSido({
        ...filters,
        OIL_TCD: row?.OIL_TCD,
        DLVRY_DT: row?.DLVRY_DT,
      });
    },
    [model.filtersRef],
  );

  // sub02 조회 (서버 onSub01GridClick → sub02Grid.search)
  const loadSigun = useCallback(
    (row: any) => {
      const filters = model.filtersRef.current ?? {};
      return api.getSigun({
        ...filters,
        OIL_TCD: row?.OIL_TCD,
        DLVRY_DT: row?.DLVRY_DT,
        LV1_CD: row?.LV1_CD,
      });
    },
    [model.filtersRef],
  );

  // 메인 클릭 → sub01 cascade (sub02 reset)
  const onMainGridClick = useCallback(
    (row: any) => {
      base.handleRowClick("main", row, [{ to: "sub01", fetch: loadSido }], {
        alsoReset: ["sub02"],
      });
    },
    [base, loadSido],
  );

  // sub01 클릭 → sub02 cascade
  const onSub01GridClick = useCallback(
    (row: any) => {
      base.handleRowClick("sub01", row, [{ to: "sub02", fetch: loadSigun }]);
    },
    [base, loadSigun],
  );

  // 조회 콜백 — 메인 set 후 첫 행 자동 선택 + sub01 cascade
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      const firstRow = data?.rows?.[0] ?? null;
      if (firstRow) {
        onMainGridClick(firstRow);
      } else {
        base.resetGrids(["sub01", "sub02"]);
      }
    },
    [base, model.grids.main, onMainGridClick],
  );

  // 추세조회 — 서버 onTrndSrch/onSub01TrndSrch/onSub02TrndSrch
  const openTrend = useCallback(
    (level: TrendLevel) => {
      const main = model.grids.main.selectedRef.current;
      if (!main) {
        base.alert(Lang.get("MSG_SRCH_AFTER_TREND_SRCH"));
        return;
      }
      const filters = model.filtersRef.current ?? {};
      const params: Record<string, any> = { ...filters };

      if (level === "sido") {
        const sub01 = model.grids.sub01.selectedRef.current;
        if (!sub01) {
          base.alert(Lang.get("MSG_SELECT_NO_DATA"));
          return;
        }
        params.LV1_CD = sub01.LV1_CD;
      } else if (level === "sigun") {
        const sub02 = model.grids.sub02.selectedRef.current;
        if (!sub02) {
          base.alert(Lang.get("MSG_SELECT_NO_DATA"));
          return;
        }
        params.LV2_CD = sub02.LV2_CD;
      }

      openPopup({
        title: "LBL_TRND_SRCH",
        width: "2xl",
        content: <OilPriceTrendPop level={level} params={params} />,
      });
    },
    [base, model.grids, model.filtersRef, openPopup],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      { type: "button", key: "LBL_TRND_SRCH", label: "LBL_TRND_SRCH", onClick: () => openTrend("all") },
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: () => model.grids.main.rows,
      }),
    ],
    [menuName, model.grids.main, model.filtersRef, openTrend],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
      { type: "button", key: "LBL_TRND_SRCH", label: "LBL_TRND_SRCH", onClick: () => openTrend("sido") },
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub01.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => {
          const main = model.grids.main.selectedRef.current;
          if (!main) return Promise.resolve({ data: { data: { dsOut: [] } } });
          return loadSido(main);
        },
        rows: () => model.grids.sub01.rows,
      }),
    ],
    [menuName, model.grids.sub01, model.grids.main, model.filtersRef, loadSido, openTrend],
  );

  const sub02Actions: ActionItem[] = useMemo(
    () => [
      { type: "button", key: "LBL_TRND_SRCH", label: "LBL_TRND_SRCH", onClick: () => openTrend("sigun") },
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub02.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => {
          const sub01 = model.grids.sub01.selectedRef.current;
          if (!sub01) return Promise.resolve({ data: { data: { dsOut: [] } } });
          return loadSigun(sub01);
        },
        rows: () => model.grids.sub02.rows,
      }),
    ],
    [menuName, model.grids.sub02, model.grids.sub01, model.filtersRef, loadSigun, openTrend],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onSub01GridClick,
    mainActions,
    sub01Actions,
    sub02Actions,
  };
}
