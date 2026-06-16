"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useApDailyReportResultModel } from "./ApDailyReportResultModel";
import { useApDailyReportResultController } from "./ApDailyReportResultController";
import { MAIN_COLUMN_DEFS } from "./ApDailyReportResultColumns";

export const MENU_CODE = "MENU_DAILY_AP_RESULT";

export default function ApDailyReportResult() {
  const model = useApDailyReportResultModel(MENU_CODE);
  const ctrl = useApDailyReportResultController({ model });

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
          rowSelection="multiple"
          audit={false}
        />
      }
    />
  );
}
