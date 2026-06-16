"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useIfVehicleDspchModel } from "./IfVehicleDspchModel";
import { useIfVehicleDspchController } from "./IfVehicleDspchController";
import { MAIN_COLUMN_DEFS } from "./IfVehicleDspchColumns";

export const MENU_CODE = "MENU_IF_VEHICLE_DSPCH";

export default function IfVehicleDspch() {
  const model = useIfVehicleDspchModel(MENU_CODE);
  const ctrl = useIfVehicleDspchController({ model });

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
