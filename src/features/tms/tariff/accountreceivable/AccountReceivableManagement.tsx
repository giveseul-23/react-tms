"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useAccountReceivableManagementModel } from "./AccountReceivableManagementModel";
import { useAccountReceivableManagementController } from "./AccountReceivableManagementController";
import { MAIN_COLUMN_DEFS } from "./AccountReceivableManagementColumns";

export const MENU_CODE = "MENU_ACCOUNT_RECEIVABLE_CONTRACT_MANAGEMENT";
// 서버 리소스 권한 authId (센차 grid.authId). 그리드별 authId 단일 소스.
export const AUTH = {
  grids: { main: "MAIN_GRID_ACCOUNT_RECEIVABLE_CONTRACT_MANAGEMENT" },
};

export default function AccountReceivableManagement() {
  const model = useAccountReceivableManagementModel(MENU_CODE);
  const ctrl = useAccountReceivableManagementController({ model });

  return (
    <GridOnlyPage
      menuCode={MENU_CODE}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        moduleDefault: "TMS",
        ...model.bindSearch(),
      }}
      grid={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          authId={AUTH.grids.main}
        />
      }
    />
  );
}
