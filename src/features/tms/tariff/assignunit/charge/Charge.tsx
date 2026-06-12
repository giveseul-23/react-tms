"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useChargeModel } from "./ChargeModel";
import { useChargeController } from "./ChargeController";
import { MAIN_COLUMN_DEFS, SUB01_COLUMN_DEFS } from "./ChargeColumns";

export const MENU_CODE = "MENU_CHARGE_MGMT";

export const AUTH = {
  grids: {
    main: "MAIN_GRID_CHARGE_MGMT",
    sub01: "SUB01_GRID_CHARGE_MGMT",
  },
};

export default function Charge() {
  const model = useChargeModel(MENU_CODE);
  const ctrl = useChargeController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[70, 30]}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      defaultDirection="vertical"
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
          authId={AUTH.grids.main}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          headerCheckbox={false}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
        />
      }
      detail={
        <DataGrid
          {...model.bind("sub01")}
          authId={AUTH.grids.sub01}
          columnDefs={SUB01_COLUMN_DEFS}
          codeMap={model.codeMap}
          headerCheckbox={false}
          actions={ctrl.sub01Actions}
          pagination={false}
        />
      }
    />
  );
}
