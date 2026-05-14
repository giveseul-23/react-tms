import { useCallback, useMemo } from "react";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/commonActions";
import { useBaseController } from "@/app/feature/useBaseController";
import { countryApi as api } from "./CountryApi";
import {
  MAIN_COLUMN_DEFS,
  STATE_COLUMN_DEFS,
  ZIP_COLUMN_DEFS,
  CITY_COLUMN_DEFS,
} from "./CountryColumns";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { MENU_CD } from "./Country";
import type { CountryModel, GridKey } from "./CountryModel";

interface Args {
  model: CountryModel;
}

export function useCountryController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getCountryList(params),
    [],
  );

  // state 클릭 → city fetch
  const onStateGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("state", row, [
        {
          to: "city",
          fetch: (r) =>
            api.getCityList({
              CTRY_CD: r.CTRY_CD,
              STT_CD: r.STT_CD,
            }),
        },
      ]),
    [base],
  );

  // main 클릭 → state, zip 동시 fetch + state 첫 행으로 city 자동 cascade
  // 단, 메인에 작업 중인(I/U/D) 행이 있으면 cascade 안 함 — 편집 내용 보존
  const onMainGridClick = useCallback(
    async (row: any) => {
      const mainRows = model.grids.main.ref.current?.rows ?? [];
      const hasDirty = mainRows.some(
        (r: any) =>
          r.EDIT_STS === "I" || r.EDIT_STS === "U" || r.EDIT_STS === "D",
      );
      if (hasDirty) return;

      base.handleRowClick(
        "main",
        row,
        [
          {
            to: "state",
            fetch: (r) => api.getStateList({ CTRY_CD: r.CTRY_CD }),
          },
          {
            to: "zip",
            fetch: (r) => api.getZipList({ CTRY_CD: r.CTRY_CD }),
          },
        ],
        {
          alsoReset: ["city"],
        },
      );
    },
    [base, model],
  );

  const handleSearch = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  //action 정의

  //main
  const onAddMain = useCallback(() => {
    base.resetGrids(["state", "city", "zip"]);
    base.addRow("main", {});
  }, [base]);

  const onSaveMain = useCallback(
    () => base.saveGrid("main", api.saveCountryList),
    [base],
  );

  //state
  const onAddState = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, "국가코드")) return;
    base.resetGrids(["city"]);
    base.addRow("state", {
      CTRY_CD: main.CTRY_CD,
    });
  }, [model, base]);

  const onSaveState = useCallback(
    () =>
      base.saveGrid("state", api.saveStateList, {
        afterSave: {
          cascadeFrom: "main",
          fetch: (main) => api.getStateList({ MENU_CD, CTRY_CD: main.CTRY_CD }),
        },
      }),
    [base],
  );

  //city
  const onAddCity = useCallback(() => {
    const state = model.grids.state.selectedRef.current;
    if (!base.requireParentRow(state, "시도코드")) return;
    base.addRow("city", {
      CTRY_CD: state.CTRY_CD,
      STT_CD: state.STT_CD,
    });
  }, [model, base]);

  const onSaveCity = useCallback(
    () =>
      base.saveGrid("city", api.saveCityList, {
        afterSave: {
          cascadeFrom: "state",
          fetch: (main) =>
            api.getCityList({
              MENU_CD,
              CTRY_CD: main.CTRY_CD,
              STT_CD: main.STT_CD,
            }),
        },
      }),
    [base],
  );

  //zip
  const onAddZip = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, "국가코드")) return;
    base.addRow("zip", {
      CTRY_CD: main.CTRY_CD,
    });
  }, [model, base]);

  const onSaveZip = useCallback(
    () =>
      base.saveGrid("zip", api.saveZipList, {
        afterSave: {
          cascadeFrom: "main",
          fetch: (main) => api.getZipList({ MENU_CD, CTRY_CD: main.CTRY_CD }),
        },
      }),
    [base],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
        columns: MAIN_COLUMN_DEFS,
        menuName: "국가관리",
        fetchFn: () => api.getCountryList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [onAddMain, onSaveMain, model],
  );

  const stateActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddState }),
      makeSaveAction({ onClick: onSaveState }),
      makeExcelGroupAction({
        columns: STATE_COLUMN_DEFS,
        menuName: "국가관리",
        fetchFn: () => api.getStateList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [onAddState, onSaveState, model],
  );

  const cityActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddCity }),
      makeSaveAction({ onClick: onSaveCity }),
      makeExcelGroupAction({
        columns: CITY_COLUMN_DEFS,
        menuName: "국가관리",
        fetchFn: () => api.getCityList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [onAddCity, onSaveCity, model],
  );

  const zipActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddZip }),
      makeSaveAction({ onClick: onSaveZip }),
      makeExcelGroupAction({
        columns: ZIP_COLUMN_DEFS,
        menuName: "국가관리",
        fetchFn: () => api.getZipList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [onAddZip, onSaveZip, model],
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
