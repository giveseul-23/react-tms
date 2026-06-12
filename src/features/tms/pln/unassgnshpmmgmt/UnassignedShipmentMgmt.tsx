"use client";

import DataGrid from "@/app/components/grid/DataGrid";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";

import { useUnassignedShipmentMgmtModel } from "./UnassignedShipmentMgmtModel";
import { useUnassignedShipmentMgmtController } from "./UnassignedShipmentMgmtController";
import { MAIN_COLUMN_DEFS } from "./UnassignedShipmentMgmtColumns";

export const MENU_CODE = "MENU_UNASSGN_SHPM_MGMT";

export const AUTH = {
  grids: { main: "MAIN_GRID_UNASSGN_SHPM_MGMT" },
};

export default function UnassignedShipmentMgmt() {
  const model = useUnassignedShipmentMgmtModel(MENU_CODE);
  const ctrl = useUnassignedShipmentMgmtController({ model });

  return (
    <GridOnlyPage
      menuCode={MENU_CODE}
      searchProps={{
        moduleDefault: "TMS",
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
          onRowClicked={ctrl.onMainGridClick}
          audit={false}
        />
      }
    />
  );
}
