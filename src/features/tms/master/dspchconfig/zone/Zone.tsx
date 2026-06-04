"use client";

import DataGrid from "@/app/components/grid/DataGrid";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";

import { useZoneModel } from "./ZoneModel";
import { useZoneController } from "./ZoneController";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  SUB02_COLUMN_DEFS,
  SUB03_COLUMN_DEFS,
} from "./ZoneColumns";

export const MENU_CODE = "MENU_ZONE_MGMT";

export default function Zone() {
  const model = useZoneModel(MENU_CODE);
  const ctrl = useZoneController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      defaultDirection="vertical"
      defaultSizes={[50, 50]}
      storageKey={model.storageKeys.outer}
      master={
        <SplitPane
          direction="horizontal"
          defaultSizes={[50, 50]}
          minSizes={[25, 25]}
          handleThickness="1.5"
          storageKey={model.storageKeys.top}
        >
          <DataGrid
            {...model.bind("main")}
            audit={{ delete: false, rowStatus: false }}
            columnDefs={MAIN_COLUMN_DEFS}
            actions={ctrl.mainActions}
            onRowClicked={ctrl.onMainGridClick}
          />
          <DataGrid
            {...model.bind("sub01")}
            columnDefs={SUB01_COLUMN_DEFS}
            actions={ctrl.subActions.sub01}
            onRowClicked={ctrl.onSub01GridClick}
          />
        </SplitPane>
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "ZONE_AREA", label: "TAB_ZONE_AREA" },
            { key: "LDNG_NLDN", label: "MENU_LDNG_NLDN_MGMT" },
          ]}
          presets={{
            ZONE_AREA: {
              render: () => (
                <DataGrid
                  {...model.bind("sub02")}
                  columnDefs={SUB02_COLUMN_DEFS}
                  actions={ctrl.subActions.sub02}
                />
              ),
            },
            LDNG_NLDN: {
              render: () => (
                <DataGrid
                  {...model.bind("sub03")}
                  columnDefs={SUB03_COLUMN_DEFS}
                  actions={ctrl.subActions.sub03}
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
