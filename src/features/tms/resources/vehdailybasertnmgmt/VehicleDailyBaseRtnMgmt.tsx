"use client";

import DataGrid from "@/app/components/grid/DataGrid";
import { useVehicleDailyBaseRtnMgmtModel } from "./VehicleDailyBaseRtnMgmtModel";
import { useVehicleDailyBaseRtnMgmtController } from "./VehicleDailyBaseRtnMgmtController";
import { MAIN_COLUMN_DEFS } from "./VehicleDailyBaseRtnMgmtColumns";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";

export const MENU_CODE = "MENU_DAILY_VEH_BSE_RTN_MGMT";

export default function VehicleDailyBaseRtnMgmt() {
  const model = useVehicleDailyBaseRtnMgmtModel(MENU_CODE);
  const ctrl = useVehicleDailyBaseRtnMgmtController({ model });

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
          actions={ctrl.mainActions}
        />
      }
    />
  );
}
