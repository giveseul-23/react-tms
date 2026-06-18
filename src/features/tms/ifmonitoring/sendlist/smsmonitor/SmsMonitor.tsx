"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSmsMonitorModel } from "./SmsMonitorModel";
import { useSmsMonitorController } from "./SmsMonitorController";
import { MAIN_COLUMN_DEFS } from "./SmsMonitorColumns";

export const MENU_CODE = "MENU_SEND_MONITORING";

export const AUTH = {
  grids: {
    main: "MAIN_GRID_SMS_MONITOR",
  },
};

export default function SmsMonitor() {
  const model = useSmsMonitorModel(MENU_CODE);
  const ctrl = useSmsMonitorController({ model });

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
          rowSelection="multiple"
          authId={AUTH.grids.main}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          audit={false}
        />
      }
    />
  );
}
