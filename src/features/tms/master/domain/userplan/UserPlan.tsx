"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useUserPlanModel } from "./UserPlanModel";
import { useUserPlanController } from "./UserPlanControllers";
import { MAIN_COLUMN_DEFS } from "./UserPlanColumns";

export const MENU_CD = "MENU_USER_PLAN_MGMT";

export default function UserPlan() {
  const model = useUserPlanModel(MENU_CD);
  const ctrl = useUserPlanController({ model });

  return (
    <GridOnlyPage
      menuCode={MENU_CD}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.onSearchCallback,
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
