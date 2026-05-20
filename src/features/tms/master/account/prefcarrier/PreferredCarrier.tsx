"use client";

import DataGrid from "@/app/components/grid/DataGrid";

import { usePreferredCarrierModel } from "./PreferredCarrierModel";
import { usePreferredCarrierController } from "./PreferredCarrierController";
import { MAIN_COLUMN_DEFS } from "./PreferredCarrierColumns";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";

export const MENU_CODE = "MENU_PREF_CARR_MGMT";

export default function PreferredCarrier() {
  const model = usePreferredCarrierModel(MENU_CODE);
  const ctrl = usePreferredCarrierController({ model });

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