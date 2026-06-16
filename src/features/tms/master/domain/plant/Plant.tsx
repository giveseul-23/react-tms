"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { usePlantModel } from "./PlantModel";
import { usePlantController } from "./PlantController";
import { MAIN_COLUMN_DEFS } from "./PlantColumns";

export const MENU_CD = "MENU_PLANT_MGMT";

export default function Plant() {
  const model = usePlantModel(MENU_CD);
  const ctrl = usePlantController({ model });

  return (
    <GridOnlyPage
      menuCode={MENU_CD}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
      }}
      grid={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          actions={ctrl.mainActions}
          audit={{ delete: false }}
        />
      }
    />
  );
}
