"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useCargoModel } from "./CargoModel.ts";
import { useCargoController } from "./CargoController.tsx";
import { MAIN_COLUMN_DEFS } from "./CargoColumns.tsx";

export const MENU_CODE = "MENU_CARGO_MGMT";

export default function Cargo() {
  const model = useCargoModel(MENU_CODE);
  const ctrl = useCargoController({ model });

  return (
    <GridOnlyPage
      menuCode={MENU_CODE}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
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
