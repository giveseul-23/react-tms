import { useCallback, MutableRefObject } from "react";
import { confirmDispatchApi } from "./ConfirmDispatchApi";
import { ConfirmDispatchModel } from "./ConfirmDispatchModel";
import { MAIN_COLUMN_DEFS } from "./ConfirmDispatchColumns";
import { makeExcelGroupAction } from "@/app/components/grid/commonActions";

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
      const params = { DSPCH_NO: row.DSPCH_NO };
      confirmDispatchApi
        .getOrderList(params)
        .then((res: any) =>
          model.setOrderRowData(res.data.result ?? res.data.data?.dsOut ?? []),
        );
      confirmDispatchApi
        .getReceiptList(params)
        .then((res: any) =>
          model.setReceiptRowData(res.data.result ?? res.data.data?.dsOut ?? []),
        );
      confirmDispatchApi
        .getReceiptHistoryList(params)
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
        .getOrderItemList({ DSPCH_NO: row.DSPCH_NO, ORD_NO: row.ORD_NO })
        .then((res: any) =>
          model.setOrderItemRowData(res.data.result ?? res.data.data?.dsOut ?? []),
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

  const mainActions = [
    {
      type: "button",
      key: "입차시각",
      label: "입차시각",
      onClick: () => doAction(() => confirmDispatchApi.startArrival(filtersRef.current)),
    },
    {
      type: "dropdown",
      key: "상차요청",
      label: "상차요청",
      items: [],
    },
    {
      type: "dropdown",
      key: "차량변경",
      label: "차량변경",
      items: [],
    },
    {
      type: "button",
      key: "배차확정",
      label: "배차확정",
      onClick: () =>
        doAction(() => confirmDispatchApi.confirmDispatch(filtersRef.current)),
    },
    {
      type: "button",
      key: "배차확정취소",
      label: "배차확정취소",
      onClick: () =>
        doAction(() => confirmDispatchApi.cancelConfirmDispatch(filtersRef.current)),
    },
    {
      type: "dropdown",
      key: "상차의뢰서",
      label: "상차의뢰서",
      items: [],
    },
    {
      type: "dropdown",
      key: "인수증발급",
      label: "인수증발급",
      items: [],
    },
    makeExcelGroupAction({
      columns: MAIN_COLUMN_DEFS,
      menuName: "배차확정",
      fetchFn: () => confirmDispatchApi.getList(filtersRef.current),
      rows: model.gridData.rows,
    }),
  ];

  const orderActions = [
    {
      type: "button",
      key: "실적입력",
      label: "실적입력",
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
