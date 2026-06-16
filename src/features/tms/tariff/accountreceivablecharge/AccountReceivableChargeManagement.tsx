"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useAccountReceivableChargeModel } from "./AccountReceivableChargeManagementModel";
import { useAccountReceivableChargeController } from "./AccountReceivableChargeManagementController";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS
} from "./AccountReceivableChargeManagementColumns";

export const MENU_CD = "MENU_ACCOUNT_RECEIVABLE_CONTRACT_CHARGE_MANAGEMENT";
export const AUTH = {
  grids: {
    main: "MAIN_GRID_ACCOUNT_RECEIVABLE_CONTRACT_CHARGE_MANAGEMENT",
    sub01: "SUB01_GRID_ACCOUNT_RECEIVABLE_CONTRACT_CHARGE_MANAGEMENT",
  },
};

export default function AccountReceivableChargeManagement() {
  const model = useAccountReceivableChargeModel(MENU_CD);
  const ctrl = useAccountReceivableChargeController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CD}
      defaultSizes={[50, 50]}
      storageKey={model.storageKeys.outer}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
        menuCode: MENU_CD,
        moduleDefault: "TMS",
      }}
      defaultDirection="vertical"
      master={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          headerCheckbox={false}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          audit={{ insertPerson: false, insertDate: false, updatePerson: false, updateTime: false }}
          authId={AUTH.grids.main}
        />
      }
      detail={
          <DataGrid
          {...model.bind("sub01")}
          columnDefs={SUB01_COLUMN_DEFS}
          headerCheckbox={false}
          pagination={true}
          audit={{ insertPerson: false, insertDate: false, updatePerson: false, updateTime: false, delete: false, rowStatus: false }}
          authId={AUTH.grids.sub01}
        />
      }
    />
  );
}
