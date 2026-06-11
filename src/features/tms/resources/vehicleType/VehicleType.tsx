"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useVehicleTypeModel } from "./VehicleTypeModel";
import { useVehicleTypeController } from "./VehicleTypeController";
import { MAIN_COLUMN_DEFS } from "./VehicleTypeColumns";

export const MENU_CODE = "MENU_VHC_TP_MGMT";

export default function VehicleType() {
  const model = useVehicleTypeModel(MENU_CODE);
  const ctrl = useVehicleTypeController({ model });

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
          actions={ctrl.mainActions}
        />
      }
    />
  );
}
