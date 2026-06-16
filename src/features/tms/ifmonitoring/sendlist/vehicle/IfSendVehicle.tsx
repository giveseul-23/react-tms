"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useIfSendVehicleModel } from "./IfSendVehicleModel";
import { useIfSendVehicleController } from "./IfSendVehicleController";
import { MAIN_COLUMN_DEFS } from "./IfSendVehicleColumns";

export const MENU_CODE = "MENU_IF_SEND_VEHICLE";

export default function IfSendVehicle() {
  const model = useIfSendVehicleModel(MENU_CODE);
  const ctrl = useIfSendVehicleController({ model });

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
          rowSelection="multiple"
          authId="MAIN_GRID_IF_SEND_VEHICLE"
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          audit={false}
        />
      }
    />
  );
}
