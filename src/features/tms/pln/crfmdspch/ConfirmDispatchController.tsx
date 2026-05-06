// 화면 고유 Controller — useGridController 베이스 훅에 featureConfig 주입.
// 화면 고유 액션(시작 처리, 배차 확정 등)은 base.actions 에 합성해 추가 반환.

import { MutableRefObject, useMemo } from "react";
import { useGridController } from "@/hooks/useGridFeature/useGridController";
import { confirmDispatchApi } from "./ConfirmDispatchApi";
import {
  confirmDispatchFeatureConfig,
  type ConfirmDispatchModel,
} from "./ConfirmDispatchModel";
import { MAIN_COLUMN_DEFS } from "./ConfirmDispatchColumns";
import { makeExcelGroupAction } from "@/app/components/grid/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";

interface ControllerArgs {
  model: ConfirmDispatchModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
}

export function useConfirmDispatchController({
  model,
  searchRef,
  filtersRef,
}: ControllerArgs) {
  const base = useGridController({
    config: confirmDispatchFeatureConfig,
    model,
    searchRef,
    filtersRef,
  });

  const doAction = (apiCall: () => Promise<any>) => {
    apiCall().then(() => searchRef.current?.());
  };

  // ── 화면 고유: master(config) 액션 ────────────────────────────
  const mainActions: ActionItem[] = useMemo(
    () => [
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
        rows: model.grids.config.rows,
      }),
    ],
    [filtersRef, searchRef, model.grids.config.rows],
  );

  const orderActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "LBL_INPT_PRFR",
        label: "LBL_INPT_PRFR",
        onClick: () =>
          doAction(() => confirmDispatchApi.inputActual(filtersRef.current)),
      },
    ],
    [filtersRef, searchRef],
  );

  return {
    ...base,
    mainActions,
    orderActions,
  };
}
