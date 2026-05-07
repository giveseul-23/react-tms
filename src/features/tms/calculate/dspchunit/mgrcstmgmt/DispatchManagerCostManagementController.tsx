import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { dispatchManagerCostApi as api } from "./DispatchManagerCostManagementApi";
import { MAIN_COLUMN_DEFS } from "./DispatchManagerCostManagementColumns";
import { makeExcelGroupAction } from "@/app/components/grid/commonActions";
import { dirtyRows } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { DispatchManagerCostModel, GridKey } from "./DispatchManagerCostManagementModel";

const masterParam = (row: any) => ({
  DSPCH_NO: row?.DSPCH_NO,
  AP_ID: row?.AP_ID,
  DEFAULT_TYPE: row?.DEFAULT_TYPE,
});

interface Args {
  model: DispatchManagerCostModel;
}

export function useDispatchManagerCostController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("main", row, [
        {
          to: "costDetail",
          fetch: (r) => api.getCostDetailList(masterParam(r)),
        },
        {
          to: "waypoint",
          fetch: (r) => api.getWaypointList(masterParam(r)),
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
    (apiCall: () => Promise<any>) =>
      apiCall().then(() => model.searchRef.current?.()),
    [model.searchRef],
  );

  const refetchSubTabs = useCallback(() => {
    const row = model.grids.main.selectedRef.current;
    if (row) onMainGridClick(row);
  }, [model.grids.main, onMainGridClick]);

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_RATE_OP_CONFIRM_CANCEL",
        label: "BTN_RATE_OP_CONFIRM_CANCEL",
        onClick: () =>
          doAction(() => api.cancelOperatorConfirm(model.filtersRef.current)),
      },
      {
        type: "button",
        key: "BTN_RATE_MG_CONFIRM",
        label: "BTN_RATE_MG_CONFIRM",
        onClick: () =>
          doAction(() => api.approveByManager(model.filtersRef.current)),
      },
      {
        type: "button",
        key: "BTN_RATE_MG_CONFIRM_CANCEL",
        label: "BTN_RATE_MG_CONFIRM_CANCEL",
        onClick: () =>
          doAction(() => api.cancelManagerApprove(model.filtersRef.current)),
      },
      {
        type: "button",
        key: "BTN_RATE_CLOSE",
        label: "BTN_RATE_CLOSE",
        onClick: () => doAction(() => api.closeCost(model.filtersRef.current)),
      },
      {
        type: "button",
        key: "BTN_RATE_CLOSE_CANCEL",
        label: "BTN_RATE_CLOSE_CANCEL",
        onClick: () =>
          doAction(() => api.cancelCostClose(model.filtersRef.current)),
      },
      makeExcelGroupAction({
        columns: MAIN_COLUMN_DEFS,
        menuName: "배차단위정산승인/마감",
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [doAction, model],
  );

  const costDetailActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_SAVE",
        label: "BTN_SAVE",
        onClick: (e: any) => {
          const saveRows = dirtyRows(e.data);
          if (saveRows.length === 0) return;
          api.saveCostDetail(saveRows).then(() => refetchSubTabs());
        },
      },
    ],
    [refetchSubTabs],
  );

  const waypointActions: any[] = useMemo(() => [], []);

  return {
    fetchList,
    handleSearch,
    onMainGridClick,
    mainActions,
    costDetailActions,
    waypointActions,
  };
}
