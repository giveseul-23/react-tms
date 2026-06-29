import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { dspchContainerApi as api } from "./DspchContainerApi";
import { MENU_CODE } from "./DspchContainer";
import type { DspchContainerModel, GridKey } from "./DspchContainerModel";

interface Args {
  model: DspchContainerModel;
}

const EMPTY_RESULT = Promise.resolve({ data: { data: { dsOut: [] } } });

export function useDspchContainerController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  // 조회조건 raw 값 → 서버 SRCH_DSPCH_* comp 대응 (서버 onSaveAfterSearch 파라미터 구성)
  const buildSearchParams = useCallback(() => {
    const s = (model.rawFiltersRef.current ?? {}) as Record<string, any>;
    return {
      LGST_GRP_CD: s.SRCH_DSPCH_LGST_GRP_CD ?? "",
      DIV_CD: s.SRCH_DSPCH_DIV_CD ?? "",
      DLVRY_DT_FROM: s.SRCH_DSPCH_DLVRY_DT_FRM ?? "",
      DLVRY_DT_TO: s.SRCH_DSPCH_DLVRY_DT_TO ?? "",
    };
  }, [model.rawFiltersRef]);

  // 메인 조회 — searchStop
  const fetchList = useCallback(
    (_params: Record<string, unknown>) => api.getMainList(buildSearchParams()),
    [buildSearchParams],
  );

  // sub01 조회 — 선택된 메인 행 기준 (서버 searchSubGrid)
  const fetchSub01 = useCallback((mainRow: any) => {
    if (!mainRow) return EMPTY_RESULT;
    return api.getSub01List({
      DSPCH_NO: mainRow.DSPCH_NO,
      STOP_ID: mainRow.STOP_ID,
      DSPCH_OP_STS: mainRow.DSPCH_OP_STS,
    });
  }, []);

  const onMainGridClick = useCallback(
    (row: any) => {
      void base.handleRowClick("main", row, [
        { to: "sub01", fetch: fetchSub01 },
      ]);
    },
    [base, fetchSub01],
  );

  // 조회 콜백 — 메인 set 후 첫 행 자동 선택 → sub01 cascade
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      const firstMain = data?.rows?.[0] ?? null;
      if (firstMain) onMainGridClick(firstMain);
      else base.resetGrids(["sub01"]);
    },
    [base, model.grids.main, onMainGridClick],
  );

  // sub01 저장 — 저장 후 메인행 기준 sub01 재조회
  const onSaveSub01 = useCallback(
    () =>
      base.saveGrid("sub01", api.save, {
        afterSave: { cascadeFrom: "main", fetch: fetchSub01 },
      }),
    [base, fetchSub01],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getMainList(buildSearchParams()),
        rows: () => model.grids.main.rows,
      }),
    ],
    [buildSearchParams, menuName, model.grids.main],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
      makeSaveAction({ onClick: onSaveSub01 }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub01.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => {
          const main = model.grids.main.selectedRef.current;
          return main ? fetchSub01(main) : EMPTY_RESULT;
        },
        rows: () => model.grids.sub01.rows,
      }),
    ],
    [fetchSub01, menuName, model.grids.main.selectedRef, model.grids.sub01, onSaveSub01],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    sub01Actions,
  };
}
