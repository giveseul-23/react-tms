import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { dispatchOperatorCostApi as api } from "./DispatchOperatorCostManagementApi";
import { MAIN_COLUMN_DEFS } from "./DispatchOperatorCostManagementColumns";
import { makeExcelGroupAction } from "@/app/components/grid/commonActions";
import { dirtyRows } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { DispatchOperatorCostModel, GridKey } from "./DispatchOperatorCostManagementModel";

const masterParam = (row: any) => ({
  DSPCH_NO: row?.DSPCH_NO,
  AP_ID: row?.AP_ID,
  DEFAULT_TYPE: row?.DEFAULT_TYPE,
});

interface Args {
  model: DispatchOperatorCostModel;
}

export function useDispatchOperatorCostController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  // master 클릭 → costDetail/waypoint/evidence cascade + costFunction reset
  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick(
        "main",
        row,
        [
          {
            to: "costDetail",
            fetch: (r) => api.getCostDetailList(masterParam(r)),
          },
          {
            to: "waypoint",
            fetch: (r) => api.getWaypointList(masterParam(r)),
          },
          {
            to: "evidence",
            fetch: (r) => api.getEvidenceList(masterParam(r)),
          },
        ],
        { alsoReset: ["costFunction"] },
      ),
    [base],
  );

  // costDetail 행 클릭 → costFunction cascade
  const onCostDetailRowClicked = useCallback(
    (row: any) =>
      base.handleRowClick("costDetail", row, [
        {
          to: "costFunction",
          fetch: (r) =>
            api.getCostFunctionList({
              DSPCH_NO: r.DSPCH_NO,
              CHG_CD: r.CHG_CD,
            }),
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
        key: "BTN_RATESHOP",
        label: "BTN_RATESHOP",
        onClick: () =>
          doAction(() => api.changeContract(model.filtersRef.current)),
      },
      {
        type: "button",
        key: "BTN_RATING",
        label: "BTN_RATING",
        onClick: () =>
          doAction(() => api.calculateCost(model.filtersRef.current)),
      },
      {
        type: "button",
        key: "BTN_ADJ_DISIT",
        label: "BTN_ADJ_DISIT",
        onClick: () =>
          doAction(() => api.adjustBulkDistance(model.filtersRef.current)),
      },
      {
        type: "button",
        key: "BTN_RECALC_DISTANCE",
        label: "BTN_RECALC_DISTANCE",
        onClick: () =>
          doAction(() =>
            api.recalculateMoveDistance(model.filtersRef.current),
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
          doAction(() => api.deleteSettlement(model.filtersRef.current)),
      },
      {
        type: "button",
        key: "BTN_SAVE",
        label: "BTN_SAVE",
        onClick: (e: any) => {
          const saveRows = dirtyRows(e.data);
          if (saveRows.length === 0) return;
          api.save(saveRows).then(() => model.searchRef.current?.());
        },
      },
      {
        type: "button",
        key: "BTN_AP_SETTLEMENT_CREATE",
        label: "BTN_AP_SETTLEMENT_CREATE",
        onClick: () =>
          doAction(() => api.createClose(model.filtersRef.current)),
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
          api.save(saveRows).then(() => model.searchRef.current?.());
        },
      },
      {
        type: "button",
        key: "BTN_ATTACH_DOC",
        label: "BTN_ATTACH_DOC",
        onClick: () => {},
      },
    ],
    [model],
  );

  const waypointActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_ADD_FI_ROUTE",
        label: "BTN_ADD_FI_ROUTE",
        onClick: () => {
          const row = model.grids.main.selectedRef.current;
          if (!row) return;
          doAction(() => api.addSettlementRoute({ DSPCH_NO: row.DSPCH_NO }));
        },
      },
      {
        type: "button",
        key: "BTN_ROLLBACK_FI_ROUTE",
        label: "BTN_ROLLBACK_FI_ROUTE",
        onClick: () => {
          const row = model.grids.main.selectedRef.current;
          if (!row) return;
          doAction(() => api.restoreRoute({ DSPCH_NO: row.DSPCH_NO }));
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
          api.saveWaypoint(saveRows).then(() => refetchSubTabs());
        },
      },
    ],
    [doAction, refetchSubTabs, model],
  );

  const evidenceActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_SAVE",
        label: "BTN_SAVE",
        onClick: (e: any) => {
          const saveRows = dirtyRows(e.data);
          if (saveRows.length === 0) return;
          api.saveEvidence(saveRows).then(() => refetchSubTabs());
        },
      },
      {
        type: "button",
        key: "LBL_FILE_DOWNLOAD",
        label: "LBL_FILE_DOWNLOAD",
        onClick: () => {},
      },
    ],
    [refetchSubTabs],
  );

  return {
    fetchList,
    handleSearch,
    onMainGridClick,
    onCostDetailRowClicked,
    mainActions,
    costDetailActions,
    waypointActions,
    evidenceActions,
  };
}
