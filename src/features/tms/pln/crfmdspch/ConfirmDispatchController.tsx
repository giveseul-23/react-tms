// src/features/tms/pln/crfmdspch/ConfirmDispatchController.tsx
//
// useBaseController + cascade(config → order/receipt/receiptHistory, order → orderItem)
// + 메인 액션(선택행 기반): 작업시작/상차요청군/배차확정·취소/차량변경/상차지시서/인수증/조수배정.

import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { confirmDispatchApi as api } from "./ConfirmDispatchApi";
import { MENU_CODE } from "./ConfirmDispatch";
import {
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { ConfirmDispatchModel, GridKey } from "./ConfirmDispatchModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { Lang } from "@/app/services/common/Lang";

const masterChildParamMap = (row: any) => ({
  DSPCH_NO: row?.DSPCH_NO,
  PLN_ID: row?.PLN_ID,
});

interface Args {
  model: ConfirmDispatchModel;
}

export function useConfirmDispatchController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick(
        "config",
        row,
        [
          { to: "order", fetch: (r) => api.getShipmentList(masterChildParamMap(r)) },
          { to: "receipt", fetch: (r) => api.getPodList(masterChildParamMap(r)) },
          {
            to: "receiptHistory",
            fetch: (r) => api.getPodEventLogList(masterChildParamMap(r)),
          },
        ],
        { alsoReset: ["orderItem"] },
      ),
    [base],
  );

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

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.config.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.config, onMainGridClick],
  );

  // 선택행 기반 액션 (필요 시 confirm)
  const act = useCallback(
    (
      apiFn: (rows: any[]) => Promise<any>,
      e: any,
      opts?: { confirm?: string },
    ) => {
      const rows = e?.data ?? [];
      if (rows.length === 0) {
        base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_CONFIRM"));
        return;
      }
      const run = () => base.callAjax(apiFn(rows)).then(() => base.search());
      if (opts?.confirm) base.confirm(Lang.get(opts.confirm), run);
      else run();
    },
    [base],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_SP_START_WORK",
        label: "BTN_SP_START_WORK",
        onClick: (e: any) => act(api.onStartWork, e),
      },
      {
        type: "dropdown",
        key: "BTN_DISPATCH_LOADING_REQUEST",
        label: "BTN_DISPATCH_LOADING_REQUEST",
        items: [
          { type: "button", key: "REQ", label: "BTN_DISPATCH_LOADING_REQUEST", onClick: (e: any) => act(api.onRequestLoading, e) },
          { type: "button", key: "REQ_CANCEL", label: "BTN_DISPATCH_LOADING_REQUEST_CANCEL", onClick: (e: any) => act(api.onCancelLoadingRequest, e) },
          { type: "button", key: "RST_UPDATE", label: "BTN_DISPATCH_LOADING_RST_UPDATE", onClick: (e: any) => act(api.onRequestLoadingComplete, e) },
          { type: "button", key: "CMPLT_CANCEL", label: "BTN_DISPATCH_CANCEL_LDNG_CMPLT", onClick: (e: any) => act(api.onCancelLoadingComplete, e) },
          { type: "button", key: "ADDSHPM", label: "BTN_REQLDNG_ADDSHPM", onClick: (e: any) => act(api.onRequestLoadingAddShpm, e) },
        ],
      },
      {
        type: "dropdown",
        key: "BTN_VEHICLE_CHANGE",
        label: "BTN_VEHICLE_CHANGE",
        items: [
          { type: "button", key: "REG", label: "BTN_CHANGE_REG_VEH", onClick: (e: any) => act(api.onChangeRegVeh, e) },
          { type: "button", key: "SPOT", label: "BTN_REG_SPOT_VEH", onClick: (e: any) => act(api.onChangeTempVeh, e) },
        ],
      },
      {
        type: "button",
        key: "BTN_DISPATCH_CONFIRM",
        label: "BTN_DISPATCH_CONFIRM",
        onClick: (e: any) => act(api.onDispatchConfirm, e),
      },
      {
        type: "button",
        key: "BTN_DISPATCH_CONFIRM_CANCEL",
        label: "BTN_DISPATCH_CONFIRM_CANCEL",
        onClick: (e: any) => act(api.onDispatchConfirmCancel, e),
      },
      {
        type: "dropdown",
        key: "LBL_LOADING_ORDER",
        label: "LBL_LOADING_ORDER",
        items: [
          { type: "button", key: "ORDR", label: "LBL_LOADING_ORDER", onClick: (e: any) => act((rows) => api.searchLdngOrder({ dsSave: rows }), e) },
        ],
      },
      {
        type: "dropdown",
        key: "LBL_POD_PRINT",
        label: "LBL_POD_PRINT",
        items: [
          { type: "button", key: "ISSUE", label: "BTN_POD_ISSUE", onClick: (e: any) => act(api.issuePod, e) },
          { type: "button", key: "REISSUE", label: "BTN_POD_REISSUE", onClick: (e: any) => act(api.createPodReportOrReprint, e) },
          { type: "button", key: "CANCEL", label: "BTN_CANCEL_POD_ISSUE", onClick: (e: any) => act(api.cancelIssuePod, e, { confirm: "TTL_CONFIRM" }) },
        ],
      },
      {
        type: "button",
        key: "BTN_HELPER_ASSIGNMENT",
        label: "BTN_HELPER_ASSIGNMENT",
        onClick: (e: any) => act(api.onAssistRegister, e),
      },
      makeExcelGroupAction({
        excelColumns: () => model.grids.config.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.config.rows,
      }),
    ],
    [act, menuName, model.filtersRef, model.grids.config],
  );

  // 주문 상세(sub01) 저장
  const orderActions: ActionItem[] = useMemo(
    () => [
      makeSaveAction({
        onClick: () =>
          base.saveGrid("order", api.saveShipmentDetail, {
            afterSave: {
              cascadeFrom: "config",
              fetch: (m: any) => api.getShipmentList(masterChildParamMap(m)),
            },
          }),
      }),
    ],
    [base],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onOrderGridClick,
    mainActions,
    orderActions,
  };
}
