"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useApDailyManagementModel } from "./ApDailyManagementModel";
import { useApDailyManagementController } from "./ApDailyManagementController";

export const MENU_CODE = "MENU_AP_DAILY_MGMT";

export default function ApDailyManagement() {
  const model = useApDailyManagementModel(MENU_CODE);
  const ctrl = useApDailyManagementController({ model });

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
          layoutType="tab"
          tabs={[
            { key: "DAILY", label: "LBL_DAY_REPORT" },
            { key: "DETAIL", label: "LBL_DTL_DESC" },
          ]}
          presets={{
            DAILY: {
              render: () => (
                <DataGrid
                  {...model.bind("main")}
                  columnDefs={model.mainColumnDefs}
                  codeMap={model.codeMap}
                  actions={ctrl.mainActions}
                  onRowClicked={ctrl.onMainGridClick}
                  audit={false}
                />
              ),
            },
            DETAIL: {
              render: () => (
                <DataGrid
                  {...model.bind("detail")}
                  columnDefs={model.detailColumnDefs}
                  codeMap={model.codeMap}
                  actions={ctrl.detailActions}
                  audit={false}
                />
              ),
            },
          }}
          actions={[]}
        />
      }
    />
  );
}
