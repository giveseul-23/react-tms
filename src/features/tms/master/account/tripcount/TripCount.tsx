"use client";

import DataGrid from "@/app/components/grid/DataGrid";

import { useTripCountModel } from "./TripCountModel";
import { useTripCountController } from "./TripCountController";
import { MAIN_COLUMN_DEFS } from "./TripCountColumns";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";

export const MENU_CODE = "MENU_TRIPCNT_MGMT";

export default function TripCount() {
  const model = useTripCountModel(MENU_CODE);
  const ctrl = useTripCountController({ model });

  return (
    <GridOnlyPage
      menuCode={MENU_CODE}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.onSearchCallback,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
      }}
      grid={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          actions={ctrl.mainActions}
        />
      }
    />
  );
}