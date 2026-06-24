"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useApDailyReportResultModel } from "./ApDailyReportResultModel";
import { useApDailyReportResultController } from "./ApDailyReportResultController";
import { MAIN_COLUMN_DEFS } from "./ApDailyReportResultColumns";

export const MENU_CODE = "MENU_DAILY_AP_RESULT";
export const AUTH = {
  grids: {
    main: "MAIN_DAILY_AP_RESULT_GRID",
  },
};

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
        excludes: ["DLVRY_DT_FROM", "DLVRY_DT_TO", "CREATION_YN"],
        ...model.bindSearch(),
      }}
      grid={
        <DataGrid
          {...model.bind("main")}
          authId={AUTH.grids.main}
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
