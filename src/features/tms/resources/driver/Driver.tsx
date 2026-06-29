"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useDriverModel } from "./DriverModel";
import { useDriverController } from "./DriverController";
import { MAIN_COLUMN_DEFS, SUB01_COLUMN_DEFS } from "./DriverColumns";

export const MENU_CODE = "MENU_DRVR_MGMT";

export default function Driver() {
  const model = useDriverModel(MENU_CODE);
  const ctrl = useDriverController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[50, 50]}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
        excludes: ["AU.CUST_CD"],
      }}
      defaultDirection="vertical"
      layoutToggle={true}
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          gridOptions={{
            onCellEditingStarted: ctrl.onMainCellEditingStarted,
          }}
          audit={{ delete: false }}
          headerCheckbox={false}
        />
      }
      detail={
        <DataGrid
          {...model.bind("sub01")}
          columnDefs={SUB01_COLUMN_DEFS}
          actions={ctrl.sub01Actions}
          subTitle="LBL_CUSTOMER"
          headerCheckbox={false}
        />
      }
    />
  );
}
