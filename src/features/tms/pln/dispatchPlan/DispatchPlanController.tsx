// src/views/dispatchPlan/DispatchPlanController.tsx
import { useCallback, MutableRefObject } from "react";
import { dispatchPlanApi } from "@/features/tms/pln/dispatchPlan/dispatchPlanApi.ts";
import { useApiHandler } from "@/hooks/useApiHandler";
import { useGuard } from "@/hooks/useGuard";
import { DispatchPlanModel } from "./DispatchPlanModel";
import { MAIN_COLUMN_DEFS } from "./DispatchPlanColumns";
import {
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/commonActions";

type ControllerProps = {
  model: DispatchPlanModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
  rawFiltersRef: MutableRefObject<Record<string, string>>;
};

export function useDispatchPlanController({
  model,
  searchRef,
  filtersRef,
  rawFiltersRef,
}: ControllerProps) {
  const { handleApi } = useApiHandler();
  const { guardHasData } = useGuard();

  // ── fetch ────────────────────────────────────────────────────
  const fetchDispatchPlanList = useCallback(
    (params: Record<string, unknown>) =>
      dispatchPlanApi.getDispatchPlanList(params),
    [],
  );

  // ── 조회 완료 콜백 ──────────────────────────────────────────
  const handleSearch = useCallback(
    (data: any) => {
      model.setGridData(data);
      model.resetSubGrids();
    },
    [model],
  );

  // ── 행 클릭: 세 개의 하단 탭 데이터 병렬 조회 ────────────────
  const handleRowClicked = useCallback(
    (row: any) => {
      model.setSelectedHeaderRow(row);

      Promise.all([
        dispatchPlanApi.getStopList({ DSPCH_NO: row.DSPCH_NO }),
        dispatchPlanApi.getAllocOrderList({ DSPCH_NO: row.DSPCH_NO }),
        // dispatchPlanApi.getUnallocOrderList({
        //   DLVRY_DT: row.DLVRY_DT,
        //   LGST_GRP_CD: row.LGST_GRP_CD,
        // }),
      ])
        .then(([stopRes, allocRes, unallocRes]: any[]) => {
          model.setStopRowData(
            stopRes.data.result ?? stopRes.data.data?.dsOut ?? [],
          );
          model.setAllocOrderRowData(
            allocRes.data.result ?? allocRes.data.data?.dsOut ?? [],
          );
          // model.setUnallocOrderRowData(
          //   unallocRes.data.result ?? unallocRes.data.data?.dsOut ?? [],
          // );
        })
        .catch((err) => {
          console.error("[DispatchPlan] row click sub-fetch failed", err);
        });
    },
    [model],
  );

  //미할당 탭 조회 (조회조건 개별 값 기반)
  const handleUnallocOrderSearch = useCallback(() => {
    const srchObj = rawFiltersRef.current;

    model.setUnallocSearching(true);
    dispatchPlanApi
      .getUnallocOrderList({
        DIV_CD: srchObj["SRCH_DSPCH_DIV_CD"],
        LGST_GRP_CD: srchObj["SRCH_DSPCH_LGST_GRP_CD"],
        PLN_ID: srchObj["SRCH_DSPCH_PLN_ID"],
        DLVRY_DT: srchObj["SRCH_DSPCH_DLVRY_DT"],
      })
      .then((res: any) => {
        model.setUnallocOrderRowData(
          res.data.result ?? res.data.data?.dsOut ?? [],
        );
      })
      .catch((err) => {
        console.error("[DispatchPlan] unalloc search failed", err);
      })
      .finally(() => {
        model.setUnallocSearching(false);
      });
  }, [model, rawFiltersRef]);

  // ── 메인 그리드 액션 ────────────────────────────────────────
  const mainActions = [
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
            handleApi(
              dispatchPlanApi.confirmPlan(e.data),
              "확정되었습니다.",
            ).then(() => searchRef.current?.());
          },
        },
      ],
    },
    makeSaveAction({
      onClick: (e: any) => {
        if (!guardHasData(e.data)) return;
        handleApi(
          dispatchPlanApi.saveDispatchPlan(e.data),
          "저장되었습니다.",
        ).then(() => searchRef.current?.());
      },
    }),
    makeExcelGroupAction({
      columns: MAIN_COLUMN_DEFS,
      menuName: "배차관리",
      fetchFn: () => dispatchPlanApi.getDispatchPlanList(filtersRef.current),
      rows: model.gridData.rows,
    }),
  ];

  // ── 경유처 액션 (ETA/상하차분할/조정/순서저장) ───────────────
  const stopActions = [
    {
      type: "button",
      key: "BTN_PREDICT_ETA",
      label: "BTN_PREDICT_ETA",
      onClick: () => {
        if (!model.selectedHeaderRow) return;
        handleApi(
          dispatchPlanApi.predictEta({
            DSPCH_NO: model.selectedHeaderRow.DSPCH_NO,
          }),
          "ETA 예측 완료",
        );
      },
    },
    {
      type: "button",
      key: "BTN_CALCULATE_ETA",
      label: "BTN_CALCULATE_ETA",
      onClick: () => {
        if (!model.selectedHeaderRow) return;
        handleApi(
          dispatchPlanApi.calcEta({
            DSPCH_NO: model.selectedHeaderRow.DSPCH_NO,
          }),
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
        if (!model.selectedHeaderRow) return;
        handleApi(
          dispatchPlanApi.saveStopOrder({
            DSPCH_NO: model.selectedHeaderRow.DSPCH_NO,
            stops: model.stopRowData,
          }),
          "저장되었습니다.",
        );
      },
    },
  ];

  // ── 할당주문 액션 ───────────────────────────────────────────
  const allocOrderActions = [
    { type: "button", key: "할당해제", label: "할당해제", onClick: () => {} },
  ];

  // ── 미할당주문 액션 ─────────────────────────────────────────
  const unallocOrderActions = [
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
  ];

  // ── SUB 공통 액션 (상품라인분할 / 상품수량분할) ─────────────
  const allocSubActions = [
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
  ];

  const unallocSubActions = [
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
  ];

  // ── 할당주문 MAIN 행 클릭 → 품목 조회 ───────────────────────
  const handleAllocOrderRowClicked = useCallback(
    (row: any) => {
      if (!row?.ORD_NO) return;
      dispatchPlanApi
        .getAllocOrderItemList({ ORD_NO: row.ORD_NO })
        .then((res: any) => {
          model.setAllocSubRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          );
        })
        .catch((err) =>
          console.error("[DispatchPlan] alloc sub-fetch failed", err),
        );
    },
    [model],
  );

  // ── 미할당주문 MAIN 행 클릭 → 품목 조회 ─────────────────────
  const handleUnallocOrderRowClicked = useCallback(
    (row: any) => {
      if (!row?.ORD_NO) return;
      dispatchPlanApi
        .getUnallocOrderItemList({ ORD_NO: row.ORD_NO })
        .then((res: any) => {
          model.setUnallocSubRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          );
        })
        .catch((err) =>
          console.error("[DispatchPlan] unalloc sub-fetch failed", err),
        );
    },
    [model],
  );

  return {
    fetchDispatchPlanList,
    handleSearch,
    handleRowClicked,
    mainActions,
    stopActions,
    allocOrderActions,
    unallocOrderActions,
    allocSubActions,
    unallocSubActions,
    handleAllocOrderRowClicked,
    handleUnallocOrderRowClicked,
  };
}
