import { useCallback, MutableRefObject } from "react";
import { confirmDispatchApi } from "./ConfirmDispatchApi";
import { ConfirmDispatchModel } from "./ConfirmDispatchModel";
import { MAIN_COLUMN_DEFS } from "./ConfirmDispatchColumns";
import { makeExcelGroupAction } from "@/app/components/grid/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";

type ControllerProps = {
  model: ConfirmDispatchModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useConfirmDispatchController({
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  const fetchList = useCallback(
    (params: Record<string, unknown>) => confirmDispatchApi.getList(params),
    [],
  );

  const fetchSubTabs = useCallback(
    (row: any) => {
      if (!row) return;
      const params = { DSPCH_NO: row.DSPCH_NO, PLN_ID: row.PLN_ID };
      confirmDispatchApi
        .getShipmentList(params)
        .then((res: any) =>
          model.setOrderRowData(res.data.result ?? res.data.data?.dsOut ?? []),
        );
      confirmDispatchApi
        .getPodList(params)
        .then((res: any) =>
          model.setReceiptRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
      confirmDispatchApi
        .getPodEventLogList(params)
        .then((res: any) =>
          model.setReceiptHistoryRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
    },
    [model],
  );

  const handleRowClicked = useCallback(
    (row: any) => {
      model.setSelectedHeaderRow(row);
      model.setOrderItemRowData([]);
      model.setSelectedOrderRow(null);
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

  const handleOrderRowClicked = useCallback(
    (row: any) => {
      model.setSelectedOrderRow(row);
      if (!row) return;
      confirmDispatchApi
        .getShipmentDetailList({
          DSPCH_NO: row.DSPCH_NO,
          SHPM_ID: row.SHPM_ID,
          PLN_ID: row.PLN_ID,
        })
        .then((res: any) =>
          model.setOrderItemRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
    },
    [model],
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
      key: "BTN_SP_START_WORK",
      label: "BTN_SP_START_WORK",
      onClick: () =>
        doAction(() => confirmDispatchApi.startArrival(filtersRef.current)),
    },
    {
      type: "dropdown",
      key: "BTN_DISPATCH_LOADING_REQUEST",
      label: "BTN_DISPATCH_LOADING_REQUEST",
      items: [],
    },
    {
      type: "dropdown",
      key: "BTN_VEHICLE_CHANGE",
      label: "BTN_VEHICLE_CHANGE",
      items: [],
    },
    {
      type: "button",
      key: "BTN_DISPATCH_CONFIRM",
      label: "BTN_DISPATCH_CONFIRM",
      onClick: () =>
        doAction(() => confirmDispatchApi.confirmDispatch(filtersRef.current)),
    },
    {
      type: "button",
      key: "BTN_DISPATCH_CONFIRM_CANCEL",
      label: "BTN_DISPATCH_CONFIRM_CANCEL",
      onClick: () =>
        doAction(() =>
          confirmDispatchApi.cancelConfirmDispatch(filtersRef.current),
        ),
    },
    {
      type: "dropdown",
      key: "LBL_LOADING_ORDER",
      label: "LBL_LOADING_ORDER",
      items: [],
    },
    {
      type: "dropdown",
      key: "LBL_POD_PRINT",
      label: "LBL_POD_PRINT",
      items: [],
    },
    makeExcelGroupAction({
      columns: MAIN_COLUMN_DEFS,
      menuName: "배차확정",
      fetchFn: () => confirmDispatchApi.getList(filtersRef.current),
      rows: model.gridData.rows,
    }),
  ];

  const orderActions: ActionItem[] = [
    {
      type: "button",
      key: "LBL_INPT_PRFR",
      label: "LBL_INPT_PRFR",
      onClick: () =>
        doAction(() => confirmDispatchApi.inputActual(filtersRef.current)),
    },
  ];

  const orderItemActions: any[] = [];

  const receiptActions: any[] = [];
  const receiptHistoryActions: any[] = [];

  return {
    fetchList,
    handleSearch,
    handleRowClicked,
    handleOrderRowClicked,
    mainActions,
    orderActions,
    orderItemActions,
    receiptActions,
    receiptHistoryActions,
  };
}
