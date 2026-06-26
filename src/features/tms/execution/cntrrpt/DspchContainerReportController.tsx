import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { dspchContainerReportApi as api } from "./DspchContainerReportApi";
import { MENU_CODE } from "./DspchContainerReport";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { DspchContainerReportModel, GridKey } from "./DspchContainerReportModel";

interface Args {
  model: DspchContainerReportModel;
}

export function useDspchContainerReportController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  // ── 메인(일자별) 조회 ──────────────────────────────────────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getMainList(params),
    [],
  );

  // ── 조회 콜백 — 3그리드 동시 조회 (서버 onSaveAfterSearch 대응) ──
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      const filters = model.filtersRef.current;
      void base.searchSub("sub01", api.getSub01List(filters));
      void base.searchSub("sub02", api.getSub02List(filters));
    },
    [base, model.grids.main, model.filtersRef],
  );

  // ── 그리드별 액션 (엑셀만) ─────────────────────────────────────
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

  const sub02Actions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub02.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getSub02List(model.filtersRef.current),
        rows: model.grids.sub02.rows,
      }),
    ],
    [menuName, model.grids.sub02, model.filtersRef],
  );

  // ── 탭 변경 — 해당 탭 그리드만 재조회 (서버 onTabChange) ─────────
  const onTabChange = useCallback(
    (key: string) => {
      const filters = model.filtersRef.current;
      if (key === "DAY") {
        void base.searchSub("main", api.getMainList(filters));
      } else if (key === "LOC") {
        void base.searchSub("sub01", api.getSub01List(filters));
      } else if (key === "VEH") {
        void base.searchSub("sub02", api.getSub02List(filters));
      }
    },
    [base, model.filtersRef],
  );

  return {
    fetchList,
    onSearchCallback,
    onTabChange,
    mainActions,
    sub01Actions,
    sub02Actions,
  };
}
