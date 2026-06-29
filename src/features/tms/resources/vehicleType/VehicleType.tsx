"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useVehicleTypeModel } from "./VehicleTypeModel";
import { useVehicleTypeController } from "./VehicleTypeController";
import { MAIN_COLUMN_DEFS } from "./VehicleTypeColumns";

export const MENU_CODE = "MENU_VHC_TP_MGMT";

// 서버 리소스 권한 authId (센차 grid.authId). 그리드별 authId 단일 소스.
export const AUTH = {
  grids: { main: "MAIN_GRID_VHC_TP_MGMT" },
};

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
          authId={AUTH.grids.main}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          actions={ctrl.mainActions}
        />
      }
    />
  );
}
