"use client";

import DataGrid from "@/app/components/grid/DataGrid";
import { useCfChargeModel } from "./CfChargeModel";
import { useCfChargeController } from "./CfChargeController";
import { MAIN_COLUMN_DEFS } from "./CfChargeColumns";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";

export const MENU_CODE = "MENU_DSPTCH_BS_GHRG_MGMT";

export default function CfCharge() {
  const model = useCfChargeModel(MENU_CODE);
  const ctrl = useCfChargeController({ model });

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
