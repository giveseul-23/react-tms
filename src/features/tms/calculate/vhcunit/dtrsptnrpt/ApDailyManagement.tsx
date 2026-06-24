"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useApDailyManagementModel } from "./ApDailyManagementModel";
import { useApDailyManagementController } from "./ApDailyManagementController";

export const MENU_CODE = "MENU_AP_DAILY_MGMT";
export const AUTH = {
  grids: {
    main: "MAIN_GRID_AP_DAILY_MGMT",
    detail: "SUB01_GRID_AP_DAILY_MGMT",
  },
};

const MAIN_SELECTION_COLUMN_DEF = {
  headerClass: "ag-selection-header-center",
  width: 30,
  minWidth: 30,
  maxWidth: 30,
  pinned: "left",
  lockPosition: "left",
};

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
                  authId={AUTH.grids.main}
                  columnDefs={model.mainColumnDefs}
                  codeMap={model.codeMap}
                  actions={ctrl.mainActions}
                  onRowClicked={ctrl.onMainGridClick}
                  rowSelection="multiple"
                  gridOptions={{ selectionColumnDef: MAIN_SELECTION_COLUMN_DEF }}
                  audit={false}
                />
              ),
            },
            DETAIL: {
              render: () => (
                <DataGrid
                  {...model.bind("detail")}
                  authId={AUTH.grids.detail}
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
