import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { dispatchManagerCostApi as api } from "./DispatchManagerCostManagementApi";
import { MENU_CODE } from "./DispatchManagerCostManagement";
import {
  makeExcelGroupAction,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import { dirtyRows } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  DispatchManagerCostModel,
  GridKey,
} from "./DispatchManagerCostManagementModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

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
  const { menuName } = useMenuMeta();

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

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  const doAction = useCallback(
    (apiCall: () => Promise<any>, msg = "MSG_SAVE_CMPLT") =>
      base.callAjax(apiCall(), { successMsg: msg, mask: "main" }).then(() => base.search()),
    [base],
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
        onClick: (e: any) =>
          doAction(() => api.cancelOperatorConfirm(e.data)),
      },
      {
        type: "button",
        key: "BTN_RATE_MG_CONFIRM",
        label: "BTN_RATE_MG_CONFIRM",
        onClick: (e: any) =>
          doAction(() => api.approveByManager(e.data)),
      },
      {
        type: "button",
        key: "BTN_RATE_MG_CONFIRM_CANCEL",
        label: "BTN_RATE_MG_CONFIRM_CANCEL",
        onClick: (e: any) =>
          doAction(() => api.cancelManagerApprove(e.data)),
      },
      {
        type: "button",
        key: "BTN_RATE_CLOSE",
        label: "BTN_RATE_CLOSE",
        onClick: (e: any) => doAction(() => api.closeCost(e.data)),
      },
      {
        type: "button",
        key: "BTN_RATE_CLOSE_CANCEL",
        label: "BTN_RATE_CLOSE_CANCEL",
        onClick: (e: any) =>
          doAction(() => api.cancelCostClose(e.data)),
      },
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: () => model.grids.main.rows,
      }),
    ],
    [doAction, menuName, model.filtersRef, model.grids.main],
  );

  const costDetailActions: ActionItem[] = useMemo(
    () => [
      makeSaveAction({
        onClick: (e: any) => {
          const saveRows = dirtyRows(e.data);
          if (saveRows.length === 0) return;
          api.saveCostDetail(saveRows).then(() => refetchSubTabs());
        },
      }),
    ],
    [refetchSubTabs],
  );

  const waypointActions: ActionItem[] = useMemo(() => [], []);

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    costDetailActions,
    waypointActions,
  };
}
