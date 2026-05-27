// src/views/dispatchPlan/DispatchPlanController.tsx
import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { dispatchPlanApi as api } from "./dispatchPlanApi";
import { useGuard } from "@/hooks/useGuard";
import { MAIN_COLUMN_DEFS } from "./DispatchPlanColumns";
import {
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { dirtyRows } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { DispatchPlanModel, GridKey } from "./DispatchPlanModel";

interface Args {
  model: DispatchPlanModel;
}

export function useDispatchPlanController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { guardHasData } = useGuard();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getDispatchPlanList(params),
    [],
  );

  // master 클릭 → stop, allocOrder cascade (unalloc 은 별도 조회)
  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick(
        "main",
        row,
        [
          {
            to: "stop",
            fetch: (r) => api.getStopList({ DSPCH_NO: r.DSPCH_NO }),
          },
          {
            to: "allocOrder",
            fetch: (r) => api.getAllocOrderList({ DSPCH_NO: r.DSPCH_NO }),
          },
        ],
        { alsoReset: ["unallocOrder", "allocSub", "unallocSub"] },
      ),
    [base],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  // alloc 행 클릭 → allocSub fetch
  const onAllocOrderRowClicked = useCallback(
    (row: any) => {
      if (!row?.ORD_NO) return;
      base.handleRowClick("allocOrder", row, [
        {
          to: "allocSub",
          fetch: (r) => api.getAllocOrderItemList({ ORD_NO: r.ORD_NO }),
        },
      ]);
    },
    [base],
  );

  // unalloc 행 클릭 → unallocSub fetch
  const onUnallocOrderRowClicked = useCallback(
    (row: any) => {
      if (!row?.ORD_NO) return;
      base.handleRowClick("unallocOrder", row, [
        {
          to: "unallocSub",
          fetch: (r) => api.getUnallocOrderItemList({ ORD_NO: r.ORD_NO }),
        },
      ]);
    },
    [base],
  );

  // 미할당 탭 조회 (조회조건 개별 값 기반)
  const handleUnallocOrderSearch = useCallback(() => {
    const srchObj = model.rawFiltersRef.current;
    model.setUnallocSearching(true);
    api
      .getUnallocOrderList({
        DIV_CD: srchObj["SRCH_DSPCH_DIV_CD"],
        LGST_GRP_CD: srchObj["SRCH_DSPCH_LGST_GRP_CD"],
        PLN_ID: srchObj["SRCH_DSPCH_PLN_ID"],
        DLVRY_DT: srchObj["SRCH_DSPCH_DLVRY_DT"],
      })
      .then((res: any) => {
        const rows = res.data.result ?? res.data.data?.dsOut ?? [];
        model.grids.unallocOrder.setData({
          rows,
          totalCount: rows.length,
          page: 1,
          limit: 20,
        });
      })
      .catch((err) =>
        console.error("[DispatchPlan] unalloc search failed", err),
      )
      .finally(() => model.setUnallocSearching(false));
  }, [model]);

  const handleSave = useCallback(() => {
    const rows = model.grids.main.ref.current?.rows ?? [];
    const dirty = dirtyRows(rows);
    if (dirty.length === 0) return;
    api.saveDispatchPlan({ dsSave: dirty }).then(() => base.search());
  }, [model, base]);

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "group",
        key: "BTN_DISPATCH_CREATE_DELETE",
        label: "BTN_DISPATCH_CREATE_DELETE",
        items: [
          {
            type: "button",
            key: "BTN_DISPATCH_CREATE",
            label: "BTN_DISPATCH_CREATE",
            onClick: () => {},
          },
          {
            type: "button",
            key: "BTN_DISPATCH_CANCEL",
            label: "BTN_DISPATCH_CANCEL",
            onClick: () => {},
          },
        ],
      },
      {
        type: "group",
        key: "BTN_PLAN_REVIEW",
        label: "BTN_PLAN_REVIEW",
        items: [
          { type: "button", key: "합차", label: "합차", onClick: () => {} },
          { type: "button", key: "분차", label: "분차", onClick: () => {} },
        ],
      },
      {
        type: "group",
        key: "BTN_VEHICLE_CHANGE",
        label: "BTN_VEHICLE_CHANGE",
        items: [
          {
            type: "button",
            key: "BTN_CHANGE_REG_DED_VEH",
            label: "BTN_CHANGE_REG_DED_VEH",
            onClick: () => {},
          },
          {
            type: "button",
            key: "LBL_CONTRACTED_VEHICLE",
            label: "LBL_CONTRACTED_VEHICLE",
            onClick: () => {},
          },
        ],
      },
      {
        type: "group",
        key: "BTN_MEMO",
        label: "BTN_MEMO",
        items: [
          {
            type: "button",
            key: "메모작성",
            label: "메모작성",
            onClick: () => {},
          },
          {
            type: "button",
            key: "메모삭제",
            label: "메모삭제",
            onClick: () => {},
          },
        ],
      },
      {
        type: "group",
        key: "BTN_INFO_SHOW",
        label: "BTN_INFO_SHOW",
        items: [
          {
            type: "button",
            key: "운행정보",
            label: "운행정보",
            onClick: () => {},
          },
        ],
      },
      {
        type: "group",
        key: "BTN_CONFIRM_PLANNED",
        label: "BTN_CONFIRM_PLANNED",
        items: [
          {
            type: "button",
            key: "BTN_CONFIRM",
            label: "BTN_CONFIRM",
            onClick: (e: any) => {
              if (!guardHasData(e.data)) return;
              base
                .callAjax(api.confirmPlan(e.data), "확정되었습니다.")
                .then(() => base.search());
            },
          },
        ],
      },
      makeSaveAction({ onClick: handleSave }),
      makeExcelGroupAction({
        columns: MAIN_COLUMN_DEFS,
        menuName: "배차관리",
        fetchFn: () => api.getDispatchPlanList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [handleSave, base, guardHasData, model],
  );

  const stopActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_PREDICT_ETA",
        label: "BTN_PREDICT_ETA",
        onClick: () => {
          const row = model.grids.main.selectedRef.current;
          if (!row) return;
          base.callAjax(
            api.predictEta({ DSPCH_NO: row.DSPCH_NO }),
            "ETA 예측 완료",
          );
        },
      },
      {
        type: "button",
        key: "BTN_CALCULATE_ETA",
        label: "BTN_CALCULATE_ETA",
        onClick: () => {
          const row = model.grids.main.selectedRef.current;
          if (!row) return;
          base.callAjax(
            api.calcEta({ DSPCH_NO: row.DSPCH_NO }),
            "ETA 계산 완료",
          );
        },
      },
      {
        type: "button",
        key: "BTN_SPLIT_STOP",
        label: "BTN_SPLIT_STOP",
        onClick: () => {},
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
        key: "순서저장",
        label: "순서저장",
        onClick: () => {
          const row = model.grids.main.selectedRef.current;
          if (!row) return;
          base.callAjax(
            api.saveStopOrder({
              DSPCH_NO: row.DSPCH_NO,
              stops: model.grids.stop.rows,
            }),
            "저장되었습니다.",
          );
        },
      },
    ],
    [base, model],
  );

  const allocOrderActions: ActionItem[] = useMemo(
    () => [
      { type: "button", key: "할당해제", label: "할당해제", onClick: () => {} },
    ],
    [],
  );

  const unallocOrderActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_SEARCH",
        label: model.unallocSearching ? "조회중..." : "조회",
        disabled: model.unallocSearching,
        onClick: handleUnallocOrderSearch,
      },
      {
        type: "button",
        key: "BTN_ASSIGN_SHIPMENT",
        label: "BTN_ASSIGN_SHIPMENT",
        onClick: () => {},
      },
    ],
    [model.unallocSearching, handleUnallocOrderSearch],
  );

  const allocSubActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_ITEM_LINE_SPLIT",
        label: "BTN_ITEM_LINE_SPLIT",
        onClick: () => {},
      },
      {
        type: "button",
        key: "BTN_ITEM_QTY_SPLIT",
        label: "BTN_ITEM_QTY_SPLIT",
        onClick: () => {},
      },
    ],
    [],
  );

  const unallocSubActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_ITEM_LINE_SPLIT",
        label: "BTN_ITEM_LINE_SPLIT",
        onClick: () => {},
      },
      {
        type: "button",
        key: "BTN_ITEM_QTY_SPLIT",
        label: "BTN_ITEM_QTY_SPLIT",
        onClick: () => {},
      },
    ],
    [],
  );

  return {
    fetchDispatchPlanList: fetchList,
    onSearchCallback,
    onMainGridClick,
    onAllocOrderRowClicked,
    onUnallocOrderRowClicked,
    mainActions,
    stopActions,
    allocOrderActions,
    unallocOrderActions,
    allocSubActions,
    unallocSubActions,
  };
}
