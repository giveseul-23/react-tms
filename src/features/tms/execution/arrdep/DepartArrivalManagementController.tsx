import { useCallback, MutableRefObject } from "react";
import { departArrivalManagementApi } from "./DepartArrivalManagementApi";
import { DepartArrivalManagementModel } from "./DepartArrivalManagementModel";
import { MAIN_COLUMN_DEFS } from "./DepartArrivalManagementColumns";
import { makeExcelGroupAction } from "@/app/components/grid/commonActions";

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

  const mainActions = [
    {
      type: "button",
      key: "인수증조회",
      label: "인수증조회",
      onClick: () =>
        doAction(() =>
          departArrivalManagementApi.inquireReceipt(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "배차운행경로관제",
      label: "배차운행경로관제",
      onClick: () =>
        doAction(() =>
          departArrivalManagementApi.controlRoute(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "입자시각",
      label: "입자시각",
      onClick: () =>
        doAction(() =>
          departArrivalManagementApi.startLoading(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "운송출발",
      label: "운송출발",
      onClick: () =>
        doAction(() =>
          departArrivalManagementApi.startTransport(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "운송출발취소",
      label: "운송출발취소",
      onClick: () =>
        doAction(() =>
          departArrivalManagementApi.cancelTransport(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "배송완료운행종료취소",
      label: "배송완료/운행종료취소",
      onClick: () =>
        doAction(() =>
          departArrivalManagementApi.cancelDeliveryComplete(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "운행종료",
      label: "운행종료",
      onClick: () =>
        doAction(() =>
          departArrivalManagementApi.completeTransport(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "재설정",
      label: "재설정",
      onClick: () =>
        doAction(() =>
          departArrivalManagementApi.resetDispatch(filtersRef.current),
        ),
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

  const stopoverActions = [
    {
      type: "button",
      key: "경로조회지도",
      label: "경로조회(지도)",
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
        departArrivalManagementApi.saveStopover(saveRows).then(() => {
          fetchSubTabs(model.selectedHeaderRowRef.current);
        });
      },
    },
    {
      type: "button",
      key: "P박스회수확정",
      label: "P박스회수확정",
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
