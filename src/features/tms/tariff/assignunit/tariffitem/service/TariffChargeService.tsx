"use client";

import DataGrid from "@/app/components/grid/DataGrid";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import { useTariffChargeServiceModel } from "./TariffChargeServiceModel";
import { useTariffChargeServiceController } from "./TariffChargeServiceController";
import { MAIN_COLUMN_DEFS } from "./TariffChargeServiceColumns";

export const MENU_CODE = "MENU_DSPTCH_SERVICE_MGMT";

export default function TariffChargeService() {
  const model = useTariffChargeServiceModel(MENU_CODE);
  const ctrl = useTariffChargeServiceController({ model });

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
          headerCheckbox={false}
        />
      }
    />
  );
}
