"use client";

import { SplitPane } from "@/app/components/layout/SplitPane";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useOverheadTariffManagementModel } from "./OverheadTariffManagementModel";
import { useOverheadTariffManagementController } from "./OverheadTariffManagementController";
import {
  MAIN_COLUMN_DEFS,
  DETAIL_LEFT_COLUMN_DEFS,
  DETAIL_RIGHT_COLUMN_DEFS,
} from "./OverheadTariffManagementColumns";

export const MENU_CODE = "MENU_OVERHEAD_TARIFF_MGMT";

export const AUTH = {
  grids: {
    main: "MAIN_GRID_OVERHEAD_MANAGEMENT",
    subChg: "SUB01_GRID_OVERHEAD_MANAGEMENT",
    subChgDtl: "SUB02_GRID_OVERHEAD_MANAGEMENT",
  },
};

export default function OverheadTariffManagement() {
  const model = useOverheadTariffManagementModel(MENU_CODE);
  const ctrl = useOverheadTariffManagementController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[40, 60]}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      defaultDirection="vertical"
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
          authId={AUTH.grids.main}
          columnDefs={MAIN_COLUMN_DEFS}
          headerCheckbox={false}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
        />
      }
      detail={
        <SplitPane
          direction="horizontal"
          defaultSizes={[50, 50]}
          minSizes={[25, 25]}
          handleThickness="1.5"
          storageKey={model.storageKeys.bottom}
        >
          <DataGrid
            {...model.bind("subChg")}
            authId={AUTH.grids.subChg}
            columnDefs={DETAIL_LEFT_COLUMN_DEFS}
            codeMap={model.codeMap}
            headerCheckbox={false}
            actions={ctrl.subChgActions}
            onRowClicked={ctrl.onSubChgRowClicked}
            pagination={false}
            audit={{ updatePerson: false, updateTime: false }}
          />
          <DataGrid
            {...model.bind("subChgDtl")}
            authId={AUTH.grids.subChgDtl}
            columnDefs={DETAIL_RIGHT_COLUMN_DEFS}
            codeMap={model.codeMap}
            headerCheckbox={false}
            actions={ctrl.subChgDtlActions}
            pagination={false}
            audit={{ insertPerson: false }}
          />
        </SplitPane>
      }
    />
  );
}
