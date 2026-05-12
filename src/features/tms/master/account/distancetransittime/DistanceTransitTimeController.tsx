import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { distanceTransitTimeApi as api } from "./DistanceTransitTimeApi";
import { MAIN_COLUMN_DEFS } from "./DistanceTransitTimeColumns";
import {
  makeCommonActions,
  makeExcelGroupAction,
} from "@/app/components/grid/commonActions";
import { dirtyRows } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { DistanceTransitTimeModel, GridKey } from "./DistanceTransitTimeModel";

interface Args {
  model: DistanceTransitTimeModel;
}

export function useDistanceTransitTimeController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

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

  const handleSearch = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  const doAction = useCallback(
    (apiCall: () => Promise<any>) => apiCall().then(() => base.search()),
    [base],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_CALC_DTTO",
        label: "BTN_CALC_DTTO",
        onClick: () =>
          doAction(() => api.calculateWithMoveDistance(model.filtersRef.current)),
      },
      {
        type: "button",
        key: "BTN_CALC_DTTO_NS",
        label: "BTN_CALC_DTTO_NS",
        onClick: () =>
          doAction(() =>
            api.calculateWithoutMoveDistance(model.filtersRef.current),
          ),
      },
      {
        type: "button",
        key: "BTN_APPLY_TMAP_DIST",
        label: "BTN_APPLY_TMAP_DIST",
        onClick: () =>
          doAction(() => api.applyMoveDistance(model.filtersRef.current)),
      },
      {
        type: "button",
        key: "BTN_ROUTE_SEARCH_OPTION",
        label: "BTN_ROUTE_SEARCH_OPTION",
        onClick: () =>
          doAction(() => api.changeRouteOption(model.filtersRef.current)),
      },
      ...makeCommonActions({
        add: true,
        save: {
          onClick: (e: any) => {
            const saveRows = dirtyRows(e.data);
            if (saveRows.length === 0) return;
            api.save(saveRows).then(() => base.search());
          },
        },
        excel: {
          columns: MAIN_COLUMN_DEFS,
          menuName: "거리/이동시간관리",
          fetchFn: () => api.getList(model.filtersRef.current),
          rows: model.grids.main.rows,
        },
      }),
    ],
    [doAction, model, base],
  );

  const historyActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_CALC_DTTO",
        label: "BTN_CALC_DTTO",
        onClick: () =>
          doAction(() => api.calculateWithMoveDistance(model.filtersRef.current)),
      },
      {
        type: "button",
        key: "BTN_CALC_DTTO_NS",
        label: "BTN_CALC_DTTO_NS",
        onClick: () =>
          doAction(() =>
            api.calculateWithoutMoveDistance(model.filtersRef.current),
          ),
      },
      {
        type: "button",
        key: "BTN_ADD",
        label: "BTN_ADD",
        onClick: () => {},
      },
      {
        type: "button",
        key: "BTN_SAVE",
        label: "BTN_SAVE",
        onClick: (e: any) => {
          const saveRows = dirtyRows(e.data);
          if (saveRows.length === 0) return;
          api.saveHistory(saveRows).then(() => {
            const main = model.grids.main.selectedRef.current;
            if (main) {
              base.searchSub(
                "history",
                api.getHistoryList({
                  DIV_CD: main.DIV_CD,
                  FRM_LOC_ID: main.FRM_LOC_ID,
                  TO_LOC_ID: main.TO_LOC_ID,
                }),
              );
            }
          });
        },
      },
    ],
    [doAction, model, base],
  );

  return {
    fetchList,
    handleSearch,
    onMainGridClick,
    mainActions,
    historyActions,
  };
}
