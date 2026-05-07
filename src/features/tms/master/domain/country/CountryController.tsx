import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { countryApi as api } from "./CountryApi";
import { MAIN_COLUMN_DEFS } from "./CountryColumns";
import { makeCommonActions } from "@/app/components/grid/commonActions";
import { MENU_CD } from "./Country";
import type { CountryModel, GridKey } from "./CountryModel";

interface Args {
  model: CountryModel;
}

export function useCountryController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });

  const fetchList = useCallback(
    (params: Record<string, unknown>) =>
      api.getCountryList(MENU_CD, { ...params }),
    [],
  );

  // state 클릭 → city fetch
  const onStateGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("state", row, [
        {
          to: "city",
          fetch: (r) =>
            api.getCityList(MENU_CD, {
              CTRY_CD: r.CTRY_CD,
              STT_CD: r.STT_CD,
            }),
        },
      ]),
    [base],
  );

  // main 클릭 → state, zip 동시 fetch + state 첫 행으로 city 자동 fetch
  const onMainGridClick = useCallback(
    async (row: any) => {
      model.grids.main.setSelected(row);
      base.resetGrids(["state", "city", "zip"]);
      if (!row) return;

      const [stateRows] = await Promise.all([
        base.searchSub(
          "state",
          api.getStateList(MENU_CD, { CTRY_CD: row.CTRY_CD }),
        ),
        base.searchSub("zip", api.getZipList(MENU_CD, { CTRY_CD: row.CTRY_CD })),
      ]);
      if (stateRows[0]) onStateGridClick(stateRows[0]);
    },
    [model, base, onStateGridClick],
  );

  const handleSearch = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  const mainActions = useMemo(
    () =>
      makeCommonActions({
        add: true,
        save: true,
        excel: {
          columns: MAIN_COLUMN_DEFS,
          menuName: "국가관리",
          fetchFn: () => api.getCountryList(MENU_CD, model.filtersRef.current),
          rows: model.grids.main.rows,
        },
      }),
    [model],
  );

  const stateActions = useMemo(
    () =>
      makeCommonActions({
        add: true,
        save: true,
        excel: {
          columns: MAIN_COLUMN_DEFS,
          menuName: "국가관리",
          fetchFn: () => api.getStateList(MENU_CD, model.filtersRef.current),
          rows: model.grids.main.rows,
        },
      }),
    [model],
  );

  const zipActions = useMemo(
    () =>
      makeCommonActions({
        add: true,
        save: true,
        excel: {
          columns: MAIN_COLUMN_DEFS,
          menuName: "국가관리",
          fetchFn: () => api.getZipList(MENU_CD, model.filtersRef.current),
          rows: model.grids.main.rows,
        },
      }),
    [model],
  );

  const cityActions = useMemo(
    () =>
      makeCommonActions({
        add: true,
        save: true,
        excel: {
          columns: MAIN_COLUMN_DEFS,
          menuName: "국가관리",
          fetchFn: () => api.getCityList(MENU_CD, model.filtersRef.current),
          rows: model.grids.main.rows,
        },
      }),
    [model],
  );

  return {
    fetchList,
    handleSearch,
    onMainGridClick,
    onStateGridClick,
    mainActions,
    stateActions,
    zipActions,
    cityActions,
  };
}
