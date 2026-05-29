"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useFreightClassModel } from "./FreightClassModel";
import { useFreightClassController } from "./FreightClassController";
import { MAIN_COLUMN_DEFS } from "./FreightClassColumns";

export const MENU_CD = "MENU_FREIGHTCLASS_MGMT";

export default function FreightClass() {
  const model = useFreightClassModel(MENU_CD);
  const ctrl = useFreightClassController({ model });

  return (
    <GridOnlyPage
      menuCode={MENU_CD}
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
