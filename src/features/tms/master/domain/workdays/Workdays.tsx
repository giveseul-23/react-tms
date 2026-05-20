"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useWorkdaysModel } from "./WorkdaysModel";
import { useWorkdaysController } from "./WorkdaysController";
import { MAIN_COLUMN_DEFS } from "./WorkdaysColumns";

export const MENU_CD = "MENU_WKD_MGMT";

export default function Workdays() {
  const model = useWorkdaysModel(MENU_CD);
  const ctrl = useWorkdaysController({ model });

  return (
    <GridOnlyPage
      menuCode={MENU_CD}
      searchProps={{
        moduleDefault: "TMS",
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
          codeMap={model.codeMap}
          actions={ctrl.mainActions}
          audit={{ delete: false }}
        />
      }
    />
  );
}
