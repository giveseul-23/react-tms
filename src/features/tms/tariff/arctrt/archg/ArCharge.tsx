"use client";

import DataGrid from "@/app/components/grid/DataGrid";
import { useArChargeModel } from "./ArChargeModel";
import { useArChargeController } from "./ArChargeController";
import { MAIN_COLUMN_DEFS } from "./ArChargeColumns";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";

export const MENU_CODE = "MENU_AR_CHG_MGMT";

export default function ArCharge() {
  const model = useArChargeModel(MENU_CODE);
  const ctrl = useArChargeController({ model });

  return (
    <GridOnlyPage
      menuCode={MENU_CODE}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
      }}
      grid={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          actions={ctrl.mainActions}
          codeMap={model.codeMap}
        />
      }
    />
  );
}
