"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useApMonthlyManagementModel } from "./ApMonthlyManagementModel";
import { useApMonthlyManagementController } from "./ApMonthlyManagementController";

export const MENU_CODE = "MENU_AP_MONTHLY_MGMT";
export const AUTH = {
  grids: {
    main: "MAIN_GRID_AP_MONTHLY_MGMT",
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

export default function ApMonthlyManagement() {
  const model = useApMonthlyManagementModel(MENU_CODE);
  const ctrl = useApMonthlyManagementController({ model });

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
          authId={AUTH.grids.main}
          columnDefs={model.mainColumnDefs}
          codeMap={model.codeMap}
          actions={ctrl.mainActions}
          rowSelection="multiple"
          gridOptions={{ selectionColumnDef: MAIN_SELECTION_COLUMN_DEF }}
          audit={false}
        />
      }
    />
  );
}
