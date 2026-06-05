import { useCallback, useRef, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { stoppedVehicleControlApi as api } from "./StoppedVehicleControlApi";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  SUB02_COLUMN_DEFS,
  SUB03_COLUMN_DEFS,
} from "./StoppedVehicleControlColumns";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { dirtyRows } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { StoppedVehicleControlModel, GridKey } from "./StoppedVehicleControlModel";

interface Args {
  model: StoppedVehicleControlModel;
}

const MENU_CODE = "MENU_STOPPED_VEH_CTRL";
const EMPTY_RESULT = Promise.resolve({ data: { data: { dsOut: [] } } });

export function useStoppedVehicleControlController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });

  // dynamicColumns 캐시 — DIV_CD + LGST_GRP_CD 조합이 바뀔 때만 재조회
  const chgCacheRef = useRef<{ key: string; list: any[] }>({
    key: "",
    list: [],
  });

  const fetchList = useCallback(
    (params: Record<string, unknown>) =>
      api.getMainList(params),
    [],
  );


  const fetchSub01 = useCallback(
    (row: any) =>
      api.getSub01List({
        LOG_TIME_ID: row.LOG_TIME_ID,
      }),
    [],
  );

  const fetchSub02 = useCallback(
    (row: any) =>
      api.getSub02List({
        LOG_TIME_ID: row.LOG_TIME_ID,
      }),
    [],
  );

  const loadSub02 = useCallback(
    async (sub01Row: any) => {
      base.resetGrids(["sub02"]);
      if (!sub01Row || String(sub01Row.EDIT_STS ?? "").trim() === "I") return;
      const sub02Rows = await base.searchSub("sub02", fetchSub02(sub01Row));
      const firstSub02 =
        model.grids.sub02.ref.current?.rows?.[0] ?? sub02Rows?.[0] ?? null;

      model.grids.sub02.setSelected(firstSub02);
    },
    [base, fetchSub02, model.grids.sub02],
  );

  const loadSub01 = useCallback(
    async (mainRow: any) => {
      base.resetGrids(["sub01", "sub02"]);
      if (!mainRow || String(mainRow.EDIT_STS ?? "").trim() === "I") return;
      const sub01Rows = await base.searchSub("sub01", fetchSub01(mainRow));
      const firstSub01 =
        model.grids.sub01.ref.current?.rows?.[0] ?? sub01Rows?.[0] ?? null;

      if (firstSub01) {
        model.grids.sub01.setSelected(firstSub01);
        await loadSub02(firstSub01);
      }
    },
    [base, fetchSub01, loadSub02, model.grids.sub01],
  );  


  const onMainGridClick = useCallback(
    async (row: any) => {
      model.grids.main.setSelected(row ?? null);
      await loadSub01(row);
    },
    [loadSub01, model.grids.main],
  );

  const onSub01GridClick = useCallback(
    async (row: any) => {
      model.grids.sub01.setSelected(row ?? null);
      await loadSub02(row);
    },
    [loadSub02, model.grids.sub01],
  );  

  const onSearchCallback = useCallback(
    async (data: any) => {
      model.grids.main.setData(data);
      const firstMain =
        model.grids.main.ref.current?.rows?.[0] ?? data?.rows?.[0] ?? null;
      if (firstMain) {
        model.grids.main.setSelected(firstMain);
        await loadSub01(firstMain);
      } else {
        base.resetGrids(["sub01", "sub02"]);
      }
    },
    [base, loadSub01, model.grids.main],
  );

  const doAction = useCallback(
    (apiCall: () => Promise<any>) =>
      apiCall().then(() => model.searchRef.current?.()),
    [model.searchRef],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
     makeExcelGroupAction({
        columns: MAIN_COLUMN_DEFS,
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: MENU_CODE,
        fetchFn: () =>
          api.getMainList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [model.filtersRef, model.grids.main.rows],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
    ],
    [
      fetchSub01,
      model.grids.main,
      model.grids.sub01.rows,
    ],
  );  

  const sub02Actions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        columns: SUB02_COLUMN_DEFS,
        excelColumns: () => model.grids.sub01.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: MENU_CODE,
        fetchFn: () => {
          const main = model.grids.main.selectedRef.current;
          return main ? fetchSub02(main) : EMPTY_RESULT;
        },
        rows: model.grids.sub01.rows,
      }),
    ],
    [
      fetchSub02,
      model.grids.main,
      model.grids.sub02.rows,
    ],
  ); 

  const sub03Actions = useMemo(
    () => [
      makeExcelGroupAction({
        columns: SUB03_COLUMN_DEFS,
        excelColumns: () => model.grids.sub03.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: MENU_CODE,
        fetchFn: () => {
          const main = model.grids.main.selectedRef.current;
          return api.getSub03List({
            LOG_TIME_ID: main?.LOG_TIME_ID,
          });
        },
        rows: model.grids.sub03.rows,
      }),
    ],
    [model],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onSub01GridClick,
    mainActions,
    sub01Actions,
    sub02Actions,
    sub03Actions
  };
}
