"use client";

import DataGrid from "@/app/components/grid/DataGrid";
import { useArSubChargeModel } from "./ArSubChargeModel";
import { useArSubChargeController } from "./ArSubChargeController";
import { MAIN_COLUMN_DEFS } from "./ArSubChargeColumns";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";

export const MENU_CODE = "MENU_AR_SUB_CHG_MGMT";

export default function ArSubCharge() {
  const model = useArSubChargeModel(MENU_CODE);
  const ctrl = useArSubChargeController({ model });

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
        />
      }
    />
  );
}
