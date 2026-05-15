import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { departArrivalManagementApi as api } from "./DepartArrivalManagementApi";
import { MAIN_COLUMN_DEFS } from "./DepartArrivalManagementColumns";
import { makeExcelGroupAction } from "@/app/components/grid/commonActions";
import { dirtyRows } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { DepartArrivalManagementModel, GridKey } from "./DepartArrivalManagementModel";

interface Args {
  model: DepartArrivalManagementModel;
}

export function useDepartArrivalManagementController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });

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
    (apiCall: () => Promise<any>, msg = "처리되었습니다.") =>
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
          doAction(
            () => api.inquireReceipt(model.filtersRef.current),
            "수령증을 조회했습니다.",
          ),
      },
      {
        type: "button",
        key: "BTN_DRIVE_HISTORY",
        label: "BTN_DRIVE_HISTORY",
        onClick: () =>
          doAction(
            () => api.controlRoute(model.filtersRef.current),
            "운행이력을 조회했습니다.",
          ),
      },
      {
        type: "button",
        key: "BTN_SP_START_WORK",
        label: "BTN_SP_START_WORK",
        onClick: () =>
          doAction(
            () => api.startLoading(model.filtersRef.current),
            "상차를 시작했습니다.",
          ),
      },
      {
        type: "button",
        key: "BTN_START_TRANSPORTATION",
        label: "BTN_START_TRANSPORTATION",
        onClick: () =>
          doAction(
            () => api.startTransport(model.filtersRef.current),
            "운송을 시작했습니다.",
          ),
      },
      {
        type: "button",
        key: "BTN_RETURN_TO_CONFIRM",
        label: "BTN_RETURN_TO_CONFIRM",
        onClick: () =>
          doAction(
            () => api.cancelTransport(model.filtersRef.current),
            "운송이 취소되었습니다.",
          ),
      },
      {
        type: "button",
        key: "BTN_DLVRY_CONFIRM/OFF_CANCEL",
        label: "BTN_DLVRY_CONFIRM/OFF_CANCEL",
        onClick: () =>
          doAction(
            () => api.cancelDeliveryComplete(model.filtersRef.current),
            "배송 확정이 취소되었습니다.",
          ),
      },
      {
        type: "button",
        key: "LBL_DRV_OFF",
        label: "LBL_DRV_OFF",
        onClick: () =>
          doAction(
            () => api.completeTransport(model.filtersRef.current),
            "운송이 완료되었습니다.",
          ),
      },
      {
        type: "button",
        key: "BTN_RE_SET",
        label: "BTN_RE_SET",
        onClick: () =>
          doAction(
            () => api.resetDispatch(model.filtersRef.current),
            "배차가 초기화되었습니다.",
          ),
      },
      {
        type: "button",
        key: "BTN_SAVE",
        label: "BTN_SAVE",
        onClick: (e: any) => {
          const saveRows = dirtyRows(e.data);
          if (saveRows.length === 0) return;
          api.save(saveRows).then(() => base.search());
        },
      },
      makeExcelGroupAction({
        columns: MAIN_COLUMN_DEFS,
        menuName: "출도착관리",
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [doAction, model, base],
  );

  const stopoverActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_SHOW_ROUTE",
        label: "BTN_SHOW_ROUTE",
        onClick: () => {},
      },
      {
        type: "button",
        key: "BTN_SAVE",
        label: "BTN_SAVE",
        onClick: (e: any) => {
          const saveRows = dirtyRows(e.data);
          if (saveRows.length === 0) return;
          api.saveStopover(saveRows).then(() => refetchSubTabs());
        },
      },
      {
        type: "button",
        key: "BTN_SAVE_CNTR",
        label: "BTN_SAVE_CNTR",
        onClick: () => {
          const row = model.grids.main.selectedRef.current;
          if (!row) return;
          doAction(
            () => api.confirmPBoxRecovery({ DSPCH_NO: row.DSPCH_NO }),
            "P-BOX 회수가 확정되었습니다.",
          );
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
