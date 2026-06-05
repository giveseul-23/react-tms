"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import DataGrid from "@/app/components/grid/DataGrid";

import { useFuelEfficiencyModel } from "./FuelEfficiencyModel";
import { useFuelEfficiencyController } from "./FuelEfficiencyController";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  SUB02_COLUMN_DEFS,
} from "./FuelEfficiencyColumns";

export const MENU_CODE = "MENU_FUEL_EFFICIENCY_MGMT";

export default function FuelEfficiency() {
  const model = useFuelEfficiencyModel(MENU_CODE);
  const ctrl = useFuelEfficiencyController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
        excludes: ["LGST_GRP_CD"],
      }}
      defaultDirection="horizontal"
      defaultSizes={[50, 50]}
      layoutToggle={true}
      storageKey={model.storageKeys.outer}
      master={
        <SplitPane
          direction="vertical"
          defaultSizes={[50, 50]}
          minSizes={[25, 25]}
          handleThickness="1.5"
          storageKey={model.storageKeys.top}
        >
          <DataGrid
            {...model.bind("main")}
            columnDefs={MAIN_COLUMN_DEFS}
            actions={ctrl.mainActions}
            onRowClicked={ctrl.onMainGridClick}
          />
          <DataGrid
            {...model.bind("sub01")}
            columnDefs={SUB01_COLUMN_DEFS}
            actions={ctrl.subActions.sub01}
            onRowClicked={ctrl.onSub01GridClick}
            audit={{ delete: false, rowStatus: false }}
            headerCheckbox={false}
          />
        </SplitPane>
      }
      detail={
        <DataGrid
          {...model.bind("sub02")}
          columnDefs={SUB02_COLUMN_DEFS}
          actions={ctrl.subActions.sub02}
          headerCheckbox={false}
        />
      }
    />
  );
}
