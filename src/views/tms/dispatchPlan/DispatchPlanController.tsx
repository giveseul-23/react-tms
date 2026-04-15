// src/views/dispatchPlan/DispatchPlanController.tsx
import { useCallback, MutableRefObject } from "react";
import { dispatchPlanApi } from "@/app/services/tms/dispatchPlan/dispatchPlanApi";
import { useApiHandler } from "@/hooks/useApiHandler";
import { useGuard } from "@/hooks/useGuard";
import { downExcelSearch, downExcelSearched } from "@/views/common/common";
import { DispatchPlanModel } from "./DispatchPlanModel";
import { MAIN_COLUMN_DEFS } from "./DispatchPlanColumns";

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
      key: "배차생성및취소",
      label: "배차생성및취소",
      items: [
        {
          type: "button",
          key: "배차생성",
          label: "배차생성",
          onClick: () => {},
        },
        {
          type: "button",
          key: "배차취소",
          label: "배차취소",
          onClick: () => {},
        },
      ],
    },
    {
      type: "group",
      key: "배차조정",
      label: "배차조정",
      items: [
        { type: "button", key: "합차", label: "합차", onClick: () => {} },
        { type: "button", key: "분차", label: "분차", onClick: () => {} },
      ],
    },
    {
      type: "group",
      key: "차량변경",
      label: "차량변경",
      items: [
        { type: "button", key: "지입차", label: "지입차", onClick: () => {} },
        { type: "button", key: "용차", label: "용차", onClick: () => {} },
      ],
    },
    {
      type: "group",
      key: "메모",
      label: "메모",
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
      key: "정보조회",
      label: "정보조회",
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
      key: "계획확정",
      label: "계획확정",
      items: [
        {
          type: "button",
          key: "확정",
          label: "확정",
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
    {
      type: "button",
      key: "저장",
      label: "저장",
      onClick: (e: any) => {
        if (!guardHasData(e.data)) return;
        handleApi(
          dispatchPlanApi.saveDispatchPlan(e.data),
          "저장되었습니다.",
        ).then(() => searchRef.current?.());
      },
    },
    {
      type: "group",
      key: "엑셀",
      label: "엑셀",
      items: [
        {
          type: "button",
          key: "조회된모든데이터다운로드",
          label: "조회된모든데이터다운로드",
          onClick: () => {
            downExcelSearch({
              columns: MAIN_COLUMN_DEFS({}),
              menuName: "배차관리",
              fetchFn: () =>
                dispatchPlanApi.getDispatchPlanList(filtersRef.current),
            });
          },
        },
        {
          type: "button",
          key: "보이는데이터다운로드",
          label: "보이는데이터다운로드",
          onClick: () => {
            downExcelSearched({
              columns: MAIN_COLUMN_DEFS({}),
              rows: model.gridData.rows,
              menuName: "배차관리",
            });
          },
        },
      ],
    },
  ];

  // ── 경유처 액션 (ETA/상하차분할/조정/순서저장) ───────────────
  const stopActions = [
    {
      type: "button",
      key: "ETA 예측",
      label: "ETA 예측",
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
      key: "ETA 계산",
      label: "ETA 계산",
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
      key: "상하차분할",
      label: "상하차분할",
      onClick: () => {},
    },
    { type: "button", key: "조정▲", label: "조정▲", onClick: () => {} },
    { type: "button", key: "조정▼", label: "조정▼", onClick: () => {} },
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
      key: "조회",
      label: model.unallocSearching ? "조회중..." : "조회",
      disabled: model.unallocSearching,
      onClick: handleUnallocOrderSearch,
    },
    { type: "button", key: "주문할당", label: "주문할당", onClick: () => {} },
  ];

  // ── SUB 공통 액션 (상품라인분할 / 상품수량분할) ─────────────
  const allocSubActions = [
    {
      type: "button",
      key: "상품라인분할",
      label: "상품라인분할",
      onClick: () => {},
    },
    {
      type: "button",
      key: "상품수량분할",
      label: "상품수량분할",
      onClick: () => {},
    },
  ];

  const unallocSubActions = [
    {
      type: "button",
      key: "상품라인분할",
      label: "상품라인분할",
      onClick: () => {},
    },
    {
      type: "button",
      key: "상품수량분할",
      label: "상품수량분할",
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
