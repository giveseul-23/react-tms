"use client";

import { useRef } from "react";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useApMonthlyManagementModel } from "./ApMonthlyManagementModel";
import { useApMonthlyManagementController } from "./ApMonthlyManagementController";

export const MENU_CODE = "MENU_AP_MONTHLY_MGMT";

export default function ApMonthlyManagement() {
  const model = useApMonthlyManagementModel(MENU_CODE);
  const rawFiltersRef = useRef<Record<string, string>>({});
  const ctrl = useApMonthlyManagementController({ model, rawFiltersRef });

  return (
    <GridOnlyPage
      menuCode={MENU_CODE}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.onSearchCallback,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        rawFiltersRef,
        pageSize: model.pageSize,
        menuCode: MENU_CODE,
      }}
      grid={
        <DataGrid
          {...model.bind("main")}
          columnDefs={model.mainColumnDefs}
          codeMap={model.codeMap}
          actions={ctrl.mainActions}
        />
      }
    />
  );
}
