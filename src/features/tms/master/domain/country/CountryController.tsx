import { useCallback, useMemo } from "react";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
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
  // (dirty 보호는 handleRowClick default — 메인에 I/U/D 행 있으면 selection/cascade skip)
  const onMainGridClick = useCallback(
    (row: any) =>
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
        { alsoReset: ["city"] },
      ),
    [base],
  );

  // setData 만 — 첫 행 자동선택 + cascade 는 DataGrid 의 첫행 자동선택이 처리.
  // 저장/refresh 후 옛 선택 PK 가 새 rows 에 있으면 그 행 자동 재선택 (PK 매칭).
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
    },
    [model.grids.main],
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
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CD,
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
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CD,
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
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CD,
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
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CD,
        menuName: "국가관리",
        fetchFn: () => api.getZipList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [onAddZip, onSaveZip, model],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onStateGridClick,
    mainActions,
    stateActions,
    zipActions,
    cityActions,
  };
}
