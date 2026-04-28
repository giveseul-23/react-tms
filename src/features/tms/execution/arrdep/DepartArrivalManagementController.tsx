import { useCallback, MutableRefObject } from "react";
import { departArrivalManagementApi } from "./DepartArrivalManagementApi";
import { DepartArrivalManagementModel } from "./DepartArrivalManagementModel";
import { MAIN_COLUMN_DEFS } from "./DepartArrivalManagementColumns";
import { makeExcelGroupAction } from "@/app/components/grid/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";

type ControllerProps = {
  model: DepartArrivalManagementModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useDepartArrivalManagementController({
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  const fetchList = useCallback(
    (params: Record<string, unknown>) =>
      departArrivalManagementApi.getList(params),
    [],
  );

  const fetchSubTabs = useCallback(
    (row: any) => {
      if (!row) return;
      const params = { DSPCH_NO: row.DSPCH_NO };

      departArrivalManagementApi
        .getStopoverList(params)
        .then((res: any) =>
          model.setStopoverRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
      departArrivalManagementApi
        .getAssignedOrderList(params)
        .then((res: any) =>
          model.setAssignedOrderRowData(
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

  const mainActions: ActionItem[] = [
    {
      type: "button",
      key: "BTN_SHOW_POD",
      label: "BTN_SHOW_POD",
      onClick: () =>
        doAction(() =>
          departArrivalManagementApi.inquireReceipt(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "BTN_DRIVE_HISTORY",
      label: "BTN_DRIVE_HISTORY",
      onClick: () =>
        doAction(() =>
          departArrivalManagementApi.controlRoute(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "BTN_SP_START_WORK",
      label: "BTN_SP_START_WORK",
      onClick: () =>
        doAction(() =>
          departArrivalManagementApi.startLoading(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "BTN_START_TRANSPORTATION",
      label: "BTN_START_TRANSPORTATION",
      onClick: () =>
        doAction(() =>
          departArrivalManagementApi.startTransport(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "BTN_RETURN_TO_CONFIRM",
      label: "BTN_RETURN_TO_CONFIRM",
      onClick: () =>
        doAction(() =>
          departArrivalManagementApi.cancelTransport(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "BTN_DLVRY_CONFIRM/OFF_CANCEL",
      label: "BTN_DLVRY_CONFIRM/OFF_CANCEL",
      onClick: () =>
        doAction(() =>
          departArrivalManagementApi.cancelDeliveryComplete(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "LBL_DRV_OFF",
      label: "LBL_DRV_OFF",
      onClick: () =>
        doAction(() =>
          departArrivalManagementApi.completeTransport(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "BTN_RE_SET",
      label: "BTN_RE_SET",
      onClick: () =>
        doAction(() =>
          departArrivalManagementApi.resetDispatch(filtersRef.current),
        ),
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
        departArrivalManagementApi
          .save(saveRows)
          .then(() => searchRef.current?.());
      },
    },
    makeExcelGroupAction({
      columns: MAIN_COLUMN_DEFS,
      menuName: "출도착관리",
      fetchFn: () => departArrivalManagementApi.getList(filtersRef.current),
      rows: model.gridData.rows,
    }),
  ];

  const stopoverActions: ActionItem[] = [
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
        const saveRows = (e.data ?? []).filter(
          (r: any) => r._isNew || r._isDirty,
        );
        if (saveRows.length === 0) return;
        departArrivalManagementApi.saveStopover(saveRows).then(() => {
          fetchSubTabs(model.selectedHeaderRowRef.current);
        });
      },
    },
    {
      type: "button",
      key: "BTN_SAVE_CNTR",
      label: "BTN_SAVE_CNTR",
      onClick: () =>
        doAction(() =>
          departArrivalManagementApi.confirmPBoxRecovery({
            DSPCH_NO: model.selectedHeaderRowRef.current?.DSPCH_NO,
          }),
        ),
    },
  ];

  const assignedOrderActions: any[] = [];

  return {
    fetchList,
    handleSearch,
    handleRowClicked,
    mainActions,
    stopoverActions,
    assignedOrderActions,
  };
}
