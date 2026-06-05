"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useApplicationModel } from "./ApplicationModel";
import { useApplicationController } from "./ApplicationController";
import { MAIN_COLUMN_DEFS } from "./ApplicationColumns";

export const MENU_CD = "MENU_APPL";

export default function Application() {
  const model = useApplicationModel(MENU_CD);

  const ctrl = useApplicationController({
    model,
  });

  return (
    <GridOnlyPage
      menuCode={MENU_CD}
      searchProps={{
        fetchFn: ctrl.fetchApplicationList,
        onSearchCallback: ctrl.onSearchCallback,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
      }}
      grid={
        <DataGrid
          {...model.bind("main")}
          layoutType="plain"
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          actions={ctrl.mainActions}
          audit={false}
        />
      }
    />
  );
}
