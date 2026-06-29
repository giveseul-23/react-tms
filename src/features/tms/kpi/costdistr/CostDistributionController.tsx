import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";

import { costDistributionApi as api } from "./CostDistributionApi";
import { MENU_CODE } from "./CostDistribution";
import type { CostDistributionModel, GridKey } from "./CostDistributionModel";

interface Args {
  model: CostDistributionModel;
}

export function useCostDistributionController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  // ── 조회 — 주문단위 조회 ──────────────────────────────────────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getMainList(params),
    [],
  );

  // ── 조회 콜백 — 탭 2개(주문단위/품목단위) 동시 조회 ────────────────
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      void base.searchSub("sub01", api.getSub01List(model.filtersRef.current));
    },
    [base, model.grids.main, model.filtersRef],
  );

  const onMainGridClick = useCallback(
    (row: any) => base.handleRowClick("main", row),
    [base],
  );

  // ── 그리드별 액션 (조회 전용 — 엑셀 다운로드만) ───────────────────
  const mainActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getMainList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [menuName, model.grids.main, model.filtersRef],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub01.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getSub01List(model.filtersRef.current),
        rows: model.grids.sub01.rows,
      }),
    ],
    [menuName, model.grids.sub01, model.filtersRef],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    sub01Actions,
  };
}
