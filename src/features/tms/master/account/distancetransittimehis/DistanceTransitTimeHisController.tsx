import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { distanceTransitTimeHisApi as api } from "./DistanceTransitTimeHisApi";
import { MAIN_COLUMN_DEFS, DETAIL_COLUMN_DEFS } from "./DistanceTransitTimeHisColumns";
import type { DistanceTransitTimeHisModel, GridKey } from "./DistanceTransitTimeHisModel";

interface ControllerArgs {
  model: DistanceTransitTimeHisModel;
}

export function useDistanceTransitTimeHisController({ model }: ControllerArgs) {
  const base = useBaseController<GridKey>({ model });

  // ── 메인 fetch (SearchFilters 의 fetchFn) ─────────────────────
  // 외부 탭 등 화면 고유 조건이 있으면 params 에 합쳐서 전달
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  // ── 메인 행 클릭 — selection + 자식(detail) cascade reset/fetch ─
  // handleRowClick 한 줄로 selection set / reset / fetch 모두 처리.
  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("main", row, [
        {
          to: "detail",
          fetch: (r) => api.getDetailList({ DIV_CD: r.DIV_CD,  FRM_LOC_ID: r.FRM_LOC_ID,  TO_LOC_ID: r.TO_LOC_ID}),
        },
      ]),
    [base],
  );

  // ── 메인 조회 콜백 (onSearch) — 첫 행 자동 선택 + cascade ──────
  // 메인 cascade 정의는 onMainGridClick 한 곳만 — onSearchCallback 가 그걸 재사용.
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );


  return {
    fetchList,
    onSearchCallback,
    onMainGridClick
  };
}
