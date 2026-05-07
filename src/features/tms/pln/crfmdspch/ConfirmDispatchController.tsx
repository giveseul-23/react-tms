// src/features/tms/pln/crfmdspch/ConfirmDispatchController.tsx
//
// useBaseController + 화면 고유 cascade(master → order/receipt/receiptHistory + order → orderItem)
// + 화면 고유 액션 (시작 처리, 배차 확정 등).

import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { confirmDispatchApi as api } from "./ConfirmDispatchApi";
import { MAIN_COLUMN_DEFS } from "./ConfirmDispatchColumns";
import { makeExcelGroupAction } from "@/app/components/grid/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { ConfirmDispatchModel, GridKey } from "./ConfirmDispatchModel";

const masterChildParamMap = (row: any) => ({
  DSPCH_NO: row?.DSPCH_NO,
  PLN_ID: row?.PLN_ID,
});

interface Args {
  model: ConfirmDispatchModel;
}

export function useConfirmDispatchController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });

  // ── 메인 fetch ────────────────────────────────────────────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  // ── 메인 행 클릭 — 3개 sub 동시 fetch + orderItem alsoReset ────
  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick(
        "config",
        row,
        [
          {
            to: "order",
            fetch: (r) => api.getShipmentList(masterChildParamMap(r)),
          },
          {
            to: "receipt",
            fetch: (r) => api.getPodList(masterChildParamMap(r)),
          },
          {
            to: "receiptHistory",
            fetch: (r) => api.getPodEventLogList(masterChildParamMap(r)),
          },
        ],
        { alsoReset: ["orderItem"] },
      ),
    [base],
  );

  // ── order 행 클릭 — orderItem cascade ──────────────────────────
  const onOrderGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("order", row, [
        {
          to: "orderItem",
          fetch: (r) =>
            api.getShipmentDetailList({
              DSPCH_NO: r.DSPCH_NO,
              SHPM_ID: r.SHPM_ID,
              PLN_ID: r.PLN_ID,
            }),
        },
      ]),
    [base],
  );

  // ── 메인 조회 콜백 — 첫 행 자동 선택 + cascade ─────────────────
  const handleSearch = useCallback(
    (data: any) => {
      model.grids.config.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.config, onMainGridClick],
  );

  // ── 액션 헬퍼: API 호출 후 메인 재조회 ────────────────────────
  const doAction = useCallback(
    (apiCall: () => Promise<any>) =>
      apiCall().then(() => model.searchRef.current?.()),
    [model.searchRef],
  );

  // ── master(config) 액션 ───────────────────────────────────────
  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_SP_START_WORK",
        label: "BTN_SP_START_WORK",
        onClick: () => doAction(() => api.startArrival(model.filtersRef.current)),
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
          doAction(() => api.confirmDispatch(model.filtersRef.current)),
      },
      {
        type: "button",
        key: "BTN_DISPATCH_CONFIRM_CANCEL",
        label: "BTN_DISPATCH_CONFIRM_CANCEL",
        onClick: () =>
          doAction(() => api.cancelConfirmDispatch(model.filtersRef.current)),
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
        columns: MAIN_COLUMN_DEFS as any,
        menuName: "배차확정",
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.config.rows,
      }),
    ],
    [doAction, model],
  );

  // ── 주문 탭 액션 ──────────────────────────────────────────────
  const orderActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "LBL_INPT_PRFR",
        label: "LBL_INPT_PRFR",
        onClick: () => doAction(() => api.inputActual(model.filtersRef.current)),
      },
    ],
    [doAction, model],
  );

  return {
    fetchList,
    handleSearch,
    onMainGridClick,
    onOrderGridClick,
    mainActions,
    orderActions,
  };
}
