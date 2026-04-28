import { useCallback, MutableRefObject } from "react";
import { dispatchOperatorCostApi } from "./DispatchOperatorCostManagementApi";
import { DispatchOperatorCostModel } from "./DispatchOperatorCostManagementModel";
import { MAIN_COLUMN_DEFS } from "./DispatchOperatorCostManagementColumns";
import { makeExcelGroupAction } from "@/app/components/grid/commonActions";
import { dirtyRows } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";

type ControllerProps = {
  model: DispatchOperatorCostModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useDispatchOperatorCostController({
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  const fetchList = useCallback(
    (params: Record<string, unknown>) =>
      dispatchOperatorCostApi.getList(params),
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

      dispatchOperatorCostApi
        .getCostDetailList(params)
        .then((res: any) =>
          model.setCostDetailRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
      dispatchOperatorCostApi
        .getWaypointList(params)
        .then((res: any) =>
          model.setWaypointRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
      dispatchOperatorCostApi
        .getEvidenceList(params)
        .then((res: any) =>
          model.setEvidenceRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
    },
    [model],
  );

  const handleRowClicked = useCallback(
    (row: any) => {
      model.setSelectedHeaderRow(row);
      model.setCostFunctionRowData([]);
      model.setSelectedCostDetailRow(null);
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

  const handleCostDetailRowClicked = useCallback(
    (row: any) => {
      model.setSelectedCostDetailRow(row);
      if (!row) return;
      dispatchOperatorCostApi
        .getCostFunctionList({
          DSPCH_NO: row.DSPCH_NO,
          CHG_CD: row.CHG_CD,
        })
        .then((res: any) =>
          model.setCostFunctionRowData(
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
      key: "BTN_RATESHOP",
      label: "BTN_RATESHOP",
      onClick: () =>
        doAction(() =>
          dispatchOperatorCostApi.changeContract(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "BTN_RATING",
      label: "BTN_RATING",
      onClick: () =>
        doAction(() =>
          dispatchOperatorCostApi.calculateCost(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "BTN_ADJ_DISIT",
      label: "BTN_ADJ_DISIT",
      onClick: () =>
        doAction(() =>
          dispatchOperatorCostApi.adjustBulkDistance(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "BTN_RECALC_DISTANCE",
      label: "BTN_RECALC_DISTANCE",
      onClick: () =>
        doAction(() =>
          dispatchOperatorCostApi.recalculateMoveDistance(filtersRef.current),
        ),
    },
    {
      type: "dropdown",
      key: "BTN_DLY_SETL",
      label: "BTN_DLY_SETL",
      items: [],
    },
    {
      type: "dropdown",
      key: "BTN_CONFIRM_COST",
      label: "BTN_CONFIRM_COST",
      items: [],
    },
    {
      type: "button",
      key: "BTN_DELETE_AP",
      label: "BTN_DELETE_AP",
      onClick: () =>
        doAction(() =>
          dispatchOperatorCostApi.deleteSettlement(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "BTN_SAVE",
      label: "BTN_SAVE",
      onClick: (e: any) => {
        const saveRows = dirtyRows(e.data);
        if (saveRows.length === 0) return;
        dispatchOperatorCostApi
          .save(saveRows)
          .then(() => searchRef.current?.());
      },
    },
    {
      type: "button",
      key: "BTN_AP_SETTLEMENT_CREATE",
      label: "BTN_AP_SETTLEMENT_CREATE",
      onClick: () =>
        doAction(() => dispatchOperatorCostApi.createClose(filtersRef.current)),
    },
    {
      type: "dropdown",
      key: "BTN_MEMO",
      label: "BTN_MEMO",
      items: [],
    },
    {
      type: "dropdown",
      key: "BTN_FREIGHT_EXCEL_UP",
      label: "BTN_FREIGHT_EXCEL_UP",
      items: [],
    },
    makeExcelGroupAction({
      columns: MAIN_COLUMN_DEFS,
      menuName: "배차단위정산",
      fetchFn: () => dispatchOperatorCostApi.getList(filtersRef.current),
      rows: model.gridData.rows,
    }),
  ];

  const costDetailActions: ActionItem[] = [
    {
      type: "button",
      key: "BTN_SAVE",
      label: "BTN_SAVE",
      onClick: (e: any) => {
        const saveRows = dirtyRows(e.data);
        if (saveRows.length === 0) return;
        dispatchOperatorCostApi
          .save(saveRows)
          .then(() => searchRef.current?.());
      },
    },
    {
      type: "button",
      key: "BTN_ATTACH_DOC",
      label: "BTN_ATTACH_DOC",
      onClick: () => {},
    },
  ];

  const waypointActions: ActionItem[] = [
    {
      type: "button",
      key: "BTN_ADD_FI_ROUTE",
      label: "BTN_ADD_FI_ROUTE",
      onClick: () => {
        if (!model.selectedHeaderRowRef.current) return;
        doAction(() =>
          dispatchOperatorCostApi.addSettlementRoute({
            DSPCH_NO: model.selectedHeaderRowRef.current.DSPCH_NO,
          }),
        );
      },
    },
    {
      type: "button",
      key: "BTN_ROLLBACK_FI_ROUTE",
      label: "BTN_ROLLBACK_FI_ROUTE",
      onClick: () => {
        if (!model.selectedHeaderRowRef.current) return;
        doAction(() =>
          dispatchOperatorCostApi.restoreRoute({
            DSPCH_NO: model.selectedHeaderRowRef.current.DSPCH_NO,
          }),
        );
      },
    },
    {
      type: "button",
      key: "BTN_ADJUST_STOP_SEQ_PLUS",
      label: "BTN_ADJUST_STOP_SEQ_PLUS",
      onClick: () => {},
    },
    {
      type: "button",
      key: "BTN_ADJUST_STOP_SEQ_MINUS",
      label: "BTN_ADJUST_STOP_SEQ_MINUS",
      onClick: () => {},
    },
    {
      type: "button",
      key: "BTN_SAVE",
      label: "BTN_SAVE",
      onClick: (e: any) => {
        const saveRows = dirtyRows(e.data);
        if (saveRows.length === 0) return;
        dispatchOperatorCostApi
          .saveWaypoint(saveRows)
          .then(() => fetchSubTabs(model.selectedHeaderRowRef.current));
      },
    },
  ];

  const evidenceActions: ActionItem[] = [
    {
      type: "button",
      key: "BTN_SAVE",
      label: "BTN_SAVE",
      onClick: (e: any) => {
        const saveRows = dirtyRows(e.data);
        if (saveRows.length === 0) return;
        dispatchOperatorCostApi
          .saveEvidence(saveRows)
          .then(() => fetchSubTabs(model.selectedHeaderRowRef.current));
      },
    },
    {
      type: "button",
      key: "LBL_FILE_DOWNLOAD",
      label: "LBL_FILE_DOWNLOAD",
      onClick: () => {},
    },
  ];

  return {
    fetchList,
    handleSearch,
    handleRowClicked,
    handleCostDetailRowClicked,
    mainActions,
    costDetailActions,
    waypointActions,
    evidenceActions,
  };
}
