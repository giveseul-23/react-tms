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
      handleRowClicked(data.rows?.[0]);
    },
    [model, handleRowClicked],
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
      key: "거리시간계산이동거리적용",
      label: "거리/시간계산(이동거리적용)",
      onClick: () =>
        doAction(() =>
          distanceTransitTimeApi.calculateWithMoveDistance(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "거리시간계산이동거리미적용",
      label: "거리/시간계산(이동거리미적용)",
      onClick: () =>
        doAction(() =>
          distanceTransitTimeApi.calculateWithoutMoveDistance(
            filtersRef.current,
          ),
        ),
    },
    {
      type: "button",
      key: "이동거리적용",
      label: "이동거리적용",
      onClick: () =>
        doAction(() =>
          distanceTransitTimeApi.applyMoveDistance(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "경로탐색옵션변경",
      label: "경로탐색옵션변경",
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
      key: "거리시간계산이동거리적용",
      label: "거리/시간계산(이동거리적용)",
      onClick: () =>
        doAction(() =>
          distanceTransitTimeApi.calculateWithMoveDistance(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "거리시간계산이동거리미적용",
      label: "거리/시간계산(이동거리미적용)",
      onClick: () =>
        doAction(() =>
          distanceTransitTimeApi.calculateWithoutMoveDistance(
            filtersRef.current,
          ),
        ),
    },
    {
      type: "button",
      key: "추가",
      label: "추가",
      onClick: () => {},
    },
    {
      type: "button",
      key: "저장",
      label: "저장",
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
