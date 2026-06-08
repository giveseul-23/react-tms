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
import { Lang } from "@/app/services/common/Lang";

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

  const refetchSubTabs = useCallback(() => {
    const row = model.grids.main.selectedRef.current;
    if (row) onMainGridClick(row);
  }, [model.grids.main, onMainGridClick]);

  // 선택행 기반 상태변경 액션
  const act = useCallback(
    (apiFn: (rows: any[]) => Promise<any>, e: any) => {
      const rows = e?.data ?? [];
      if (rows.length === 0) {
        base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_CONFIRM"));
        return;
      }
      base.callAjax(apiFn(rows)).then(() => base.search());
    },
    [base],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      // POD 조회 / 운행이력 — 팝업 기반(추후 보강)
      { type: "button", key: "BTN_SHOW_POD", label: "BTN_SHOW_POD", onClick: (e: any) => act(api.inquireReceipt as any, e) },
      { type: "button", key: "BTN_DRIVE_HISTORY", label: "BTN_DRIVE_HISTORY", onClick: (e: any) => act(api.controlRoute as any, e) },
      { type: "button", key: "BTN_SP_START_WORK", label: "BTN_SP_START_WORK", onClick: (e: any) => act(api.startLoading, e) },
      { type: "button", key: "BTN_START_TRANSPORTATION", label: "BTN_START_TRANSPORTATION", onClick: (e: any) => act(api.startTransport, e) },
      { type: "button", key: "BTN_RETURN_TO_CONFIRM", label: "BTN_RETURN_TO_CONFIRM", onClick: (e: any) => act(api.cancelTransport, e) },
      { type: "button", key: "BTN_DLVRY_CONFIRM/OFF_CANCEL", label: "BTN_DLVRY_CONFIRM/OFF_CANCEL", onClick: (e: any) => act(api.cancelDeliveryComplete, e) },
      { type: "button", key: "LBL_DRV_OFF", label: "LBL_DRV_OFF", onClick: (e: any) => act(api.completeTransport, e) },
      {
        type: "dropdown",
        key: "BTN_RE_SET",
        label: "BTN_RE_SET",
        items: [
          { type: "button", key: "MOVE_DISIT", label: "LBL_MOVE_DISIT", onClick: (e: any) => act(api.resetDispatch, e) },
          { type: "button", key: "AP_CLS", label: "LBL_AP_CLASSIFICATION", onClick: (e: any) => act(api.changeDspchApProcTp, e) },
          { type: "button", key: "PLN_ID", label: "LBL_DSPCH_PLN_ID_CHG", onClick: (e: any) => act(api.changeDspchPlnId, e) },
        ],
      },
      makeSaveAction({
        onClick: (e: any) => {
          const saveRows = dirtyRows(model.grids.main.rows);
          if (saveRows.length === 0) return;
          base.callAjax(api.save(saveRows)).then(() => base.search());
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
    [act, menuName, model.grids.main, model.filtersRef, base],
  );

  const stopoverActions: ActionItem[] = useMemo(
    () => [
      // 경로 보기 — 팝업 기반(추후 보강)
      { type: "button", key: "BTN_SHOW_ROUTE", label: "BTN_SHOW_ROUTE", onClick: () => {} },
      {
        type: "button",
        key: "BTN_SAVE_CNTR",
        label: "BTN_SAVE_CNTR",
        onClick: () => {
          const dirty = dirtyRows(model.grids.stopover.rows);
          if (dirty.length === 0) return;
          base.callAjax(api.confirmPBoxRecovery(dirty)).then(() => refetchSubTabs());
        },
      },
    ],
    [base, refetchSubTabs, model.grids.stopover],
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
