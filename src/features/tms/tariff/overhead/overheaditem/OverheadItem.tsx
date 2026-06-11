"use client";

import DataGrid from "@/app/components/grid/DataGrid";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";

import { useOverheadItemModel } from "./OverheadItemModel";
import { useOverheadItemController } from "./OverheadItemController";
import { MAIN_COLUMN_DEFS } from "./OverheadItemColumns";

export const MENU_CODE = "MENU_OVERHEAD_MGMT";

export const AUTH = {
  grids: { main: "MAIN_GRID_OVERHEAD_MGMT" },
};

export default function OverheadItem() {
  const model = useOverheadItemModel(MENU_CODE);
  const ctrl = useOverheadItemController({ model });

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
          codeMap={model.codeMap}
          authId={AUTH.grids.main}
          actions={ctrl.mainActions}
        />
      }
    />
  );
}
