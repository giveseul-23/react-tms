"use client";

import DataGrid from "@/app/components/grid/DataGrid";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";

import { useShpmUnitMgmtModel } from "./ShpmUnitMgmtModel";
import { useShpmUnitMgmtController } from "./ShpmUnitMgmtController";
import { MAIN_COLUMN_DEFS } from "./ShpmUnitMgmtColumns";

export const MENU_CODE = "MENU_SHPM_UNIT_MGMT";

export default function ShpmUnitMgmt() {
  const model = useShpmUnitMgmtModel(MENU_CODE);
  const ctrl = useShpmUnitMgmtController({ model });

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
