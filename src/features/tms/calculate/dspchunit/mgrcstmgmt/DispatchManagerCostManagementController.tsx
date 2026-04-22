import { useCallback, MutableRefObject } from "react";
import { dispatchManagerCostApi } from "./DispatchManagerCostManagementApi";
import { DispatchManagerCostModel } from "./DispatchManagerCostManagementModel";
import { MAIN_COLUMN_DEFS } from "./DispatchManagerCostManagementColumns";
import { makeExcelGroupAction } from "@/app/components/grid/commonActions";

type ControllerProps = {
  model: DispatchManagerCostModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useDispatchManagerCostController({
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  const fetchList = useCallback(
    (params: Record<string, unknown>) => dispatchManagerCostApi.getList(params),
    [],
  );

  const fetchSubTabs = useCallback(
    (row: any) => {
      if (!row) return;
      const params = {
        DSPCH_NO: row.DSPCH_NO,
        AP_ID: row.AP_ID,
        DEFAULT_TYPE: row.DEFAULT_TYPE,
      };
      dispatchManagerCostApi
        .getCostDetailList(params)
        .then((res: any) =>
          model.setCostDetailRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
      dispatchManagerCostApi
        .getWaypointList(params)
        .then((res: any) =>
          model.setWaypointRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
    },
    [model],
  );

  const handleRowClicked = useCallback(
    (row: any) => {
      model.setSelectedHeaderRow(row);
      fetchSubTabs(row);
    },
    [model, fetchSubTabs],
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
      key: "운영자확정취소",
      label: "운영자확정취소",
      onClick: () =>
        doAction(() =>
          dispatchManagerCostApi.cancelOperatorConfirm(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "관리자승인",
      label: "관리자승인",
      onClick: () =>
        doAction(() =>
          dispatchManagerCostApi.approveByManager(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "관리자승인취소",
      label: "관리자승인취소",
      onClick: () =>
        doAction(() =>
          dispatchManagerCostApi.cancelManagerApprove(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "비용마감",
      label: "비용마감",
      onClick: () =>
        doAction(() => dispatchManagerCostApi.closeCost(filtersRef.current)),
    },
    {
      type: "button",
      key: "비용마감취소",
      label: "비용마감취소",
      onClick: () =>
        doAction(() =>
          dispatchManagerCostApi.cancelCostClose(filtersRef.current),
        ),
    },
    makeExcelGroupAction({
      columns: MAIN_COLUMN_DEFS,
      menuName: "배차단위정산승인/마감",
      fetchFn: () => dispatchManagerCostApi.getList(filtersRef.current),
      rows: model.gridData.rows,
    }),
  ];

  const costDetailActions = [
    {
      type: "button",
      key: "저장",
      label: "저장",
      onClick: (e: any) => {
        const saveRows = (e.data ?? []).filter(
          (r: any) => r._isNew || r._isDirty,
        );
        if (saveRows.length === 0) return;
        dispatchManagerCostApi
          .saveCostDetail(saveRows)
          .then(() => fetchSubTabs(model.selectedHeaderRowRef.current));
      },
    },
  ];

  const waypointActions: any[] = [];

  return {
    fetchList,
    handleSearch,
    handleRowClicked,
    mainActions,
    costDetailActions,
    waypointActions,
  };
}
