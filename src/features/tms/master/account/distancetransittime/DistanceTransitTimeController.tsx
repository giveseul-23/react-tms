import { useCallback, MutableRefObject } from "react";
import { distanceTransitTimeApi } from "./DistanceTransitTimeApi";
import { DistanceTransitTimeModel } from "./DistanceTransitTimeModel";
import { MAIN_COLUMN_DEFS } from "./DistanceTransitTimeColumns";
import {
  makeCommonActions,
  makeExcelGroupAction,
} from "@/app/components/grid/commonActions";

type ControllerProps = {
  model: DistanceTransitTimeModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useDistanceTransitTimeController({
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  const fetchList = useCallback(
    (params: Record<string, unknown>) => distanceTransitTimeApi.getList(params),
    [],
  );

  const fetchHistory = useCallback(
    (row: any) => {
      if (!row) return;
      const params = {
        DIV_CD: row.DIV_CD,
        FRM_LOC_ID: row.FRM_LOC_ID,
        TO_LOC_ID: row.TO_LOC_ID,
      };
      distanceTransitTimeApi
        .getHistoryList(params)
        .then((res: any) =>
          model.setHistoryRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
    },
    [model],
  );

  const handleRowClicked = useCallback(
    (row: any) => {
      model.setSelectedHeaderRow(row);
      fetchHistory(row);
    },
    [model, fetchHistory],
  );

  const handleSearch = useCallback(
    (data: any) => {
      model.setGridData(data);
      model.resetSubGrids();
    },
    [model],
  );

  const doAction = useCallback(
    (apiCall: () => Promise<any>) => {
      apiCall().then(() => searchRef.current?.());
    },
    [searchRef],
  );

  const mainActions = [
    {
      type: "button",
      key: "BTN_CALC_DTTO",
      label: "BTN_CALC_DTTO",
      onClick: () =>
        doAction(() =>
          distanceTransitTimeApi.calculateWithMoveDistance(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "BTN_CALC_DTTO_NS",
      label: "BTN_CALC_DTTO_NS",
      onClick: () =>
        doAction(() =>
          distanceTransitTimeApi.calculateWithoutMoveDistance(
            filtersRef.current,
          ),
        ),
    },
    {
      type: "button",
      key: "BTN_APPLY_TMAP_DIST",
      label: "BTN_APPLY_TMAP_DIST",
      onClick: () =>
        doAction(() =>
          distanceTransitTimeApi.applyMoveDistance(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "BTN_ROUTE_SEARCH_OPTION",
      label: "BTN_ROUTE_SEARCH_OPTION",
      onClick: () =>
        doAction(() =>
          distanceTransitTimeApi.changeRouteOption(filtersRef.current),
        ),
    },
    ...makeCommonActions({
      add: true,
      save: {
        onClick: (e: any) => {
          const saveRows = (e.data ?? []).filter(
            (r: any) => r._isNew || r._isDirty,
          );
          if (saveRows.length === 0) return;
          distanceTransitTimeApi
            .save(saveRows)
            .then(() => searchRef.current?.());
        },
      },
      excel: {
        columns: MAIN_COLUMN_DEFS,
        menuName: "거리/이동시간관리",
        fetchFn: () => distanceTransitTimeApi.getList(filtersRef.current),
        rows: model.gridData.rows,
      },
    }),
  ];

  const historyActions = [
    {
      type: "button",
      key: "BTN_CALC_DTTO",
      label: "BTN_CALC_DTTO",
      onClick: () =>
        doAction(() =>
          distanceTransitTimeApi.calculateWithMoveDistance(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "BTN_CALC_DTTO_NS",
      label: "BTN_CALC_DTTO_NS",
      onClick: () =>
        doAction(() =>
          distanceTransitTimeApi.calculateWithoutMoveDistance(
            filtersRef.current,
          ),
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
        const saveRows = (e.data ?? []).filter(
          (r: any) => r._isNew || r._isDirty,
        );
        if (saveRows.length === 0) return;
        distanceTransitTimeApi
          .saveHistory(saveRows)
          .then(() => fetchHistory(model.selectedHeaderRowRef.current));
      },
    },
  ];

  return {
    fetchList,
    handleSearch,
    handleRowClicked,
    mainActions,
    historyActions,
  };
}
