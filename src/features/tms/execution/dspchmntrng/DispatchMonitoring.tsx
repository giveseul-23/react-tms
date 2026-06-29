"use client";

import DataGrid from "@/app/components/grid/DataGrid";

import { useDispatchMonitoringModel } from "./DispatchMonitoringModel.ts";
import { useDispatchMonitoringController } from "./DispatchMonitoringController.tsx";
import { MAIN_COLUMN_DEFS } from "./DispatchMonitoringColumns.tsx";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage.tsx";

export const MENU_CODE = "MENU_DISPATCH_SEARCH";

export default function DispatchMonitoring() {
  const model = useDispatchMonitoringModel(MENU_CODE);
  const ctrl = useDispatchMonitoringController({ model });

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
          audit={{ delete: false }}
        />
      }
    />
  );
}
