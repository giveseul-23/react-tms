import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { departArrivalManagementApi as api } from "./DepartArrivalManagementApi";
import { MENU_CD } from "./DepartArrivalManagement";
import {
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { dirtyRows } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  DepartArrivalManagementModel,
  GridKey,
} from "./DepartArrivalManagementModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: DepartArrivalManagementModel;
}

export function useDepartArrivalManagementController({ model }: Args) {
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
          to: "stopover",
          fetch: (r) => api.getStopoverList({ DSPCH_NO: r.DSPCH_NO }),
        },
        {
          to: "assignedOrder",
          fetch: (r) => api.getAssignedOrderList({ DSPCH_NO: r.DSPCH_NO }),
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
    (apiCall: () => Promise<any>, msg = "MSG_SAVE_CMPLT.") =>
      base.callAjax(apiCall(), msg).then(() => base.search()),
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
        key: "BTN_SHOW_POD",
        label: "BTN_SHOW_POD",
        onClick: () =>
          doAction(() => api.inquireReceipt(model.filtersRef.current)),
      },
      {
        type: "button",
        key: "BTN_DRIVE_HISTORY",
        label: "BTN_DRIVE_HISTORY",
        onClick: () =>
          doAction(() => api.controlRoute(model.filtersRef.current)),
      },
      {
        type: "button",
        key: "BTN_SP_START_WORK",
        label: "BTN_SP_START_WORK",
        onClick: () =>
          doAction(() => api.startLoading(model.filtersRef.current)),
      },
      {
        type: "button",
        key: "BTN_START_TRANSPORTATION",
        label: "BTN_START_TRANSPORTATION",
        onClick: () =>
          doAction(() => api.startTransport(model.filtersRef.current)),
      },
      {
        type: "button",
        key: "BTN_RETURN_TO_CONFIRM",
        label: "BTN_RETURN_TO_CONFIRM",
        onClick: () =>
          doAction(() => api.cancelTransport(model.filtersRef.current)),
      },
      {
        type: "button",
        key: "BTN_DLVRY_CONFIRM/OFF_CANCEL",
        label: "BTN_DLVRY_CONFIRM/OFF_CANCEL",
        onClick: () =>
          doAction(() => api.cancelDeliveryComplete(model.filtersRef.current)),
      },
      {
        type: "button",
        key: "LBL_DRV_OFF",
        label: "LBL_DRV_OFF",
        onClick: () =>
          doAction(() => api.completeTransport(model.filtersRef.current)),
      },
      {
        type: "button",
        key: "BTN_RE_SET",
        label: "BTN_RE_SET",
        onClick: () =>
          doAction(() => api.resetDispatch(model.filtersRef.current)),
      },
      makeSaveAction({
        onClick: (e: any) => {
          const saveRows = dirtyRows(e.data);
          if (saveRows.length === 0) return;
          api.save(saveRows).then(() => base.search());
        },
      }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CD,
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [menuName, model.grids.main, model.filtersRef, doAction, base],
  );

  const stopoverActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_SHOW_ROUTE",
        label: "BTN_SHOW_ROUTE",
        onClick: () => {},
      },
      makeSaveAction({
        onClick: (e: any) => {
          api.saveStopover(e).then(() => refetchSubTabs());
        },
      }),
      {
        type: "button",
        key: "BTN_SAVE_CNTR",
        label: "BTN_SAVE_CNTR",
        onClick: () => {
          const row = model.grids.main.selectedRef.current;
          if (!row) return;
          doAction(() => api.confirmPBoxRecovery({ DSPCH_NO: row.DSPCH_NO }));
        },
      },
    ],
    [doAction, refetchSubTabs, model],
  );

  const assignedOrderActions: ActionItem[] = useMemo(() => [], []);

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    stopoverActions,
    assignedOrderActions,
  };
}
