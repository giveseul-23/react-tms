"use client";

import DataGrid from "@/app/components/grid/DataGrid";
import { useArCalculationClassModel } from "./ArCalculationClassModel";
import { useArCalculationClassController } from "./ArCalculationClassController";
import { MAIN_COLUMN_DEFS } from "./ArCalculationClassColumns";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";

export const MENU_CODE = "MENU_AR_CALC_CLSS_MGMT";

export default function ArCalculationClass() {
  const model = useArCalculationClassModel(MENU_CODE);
  const ctrl = useArCalculationClassController({ model });

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
