"use client";

import { SplitPane } from "@/app/components/layout/SplitPane";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useShpmMgmtModel } from "./ShpmMgmtModel";
import { useShpmMgmtController } from "./ShpmMgmtController";
import {
  MAIN_COLUMN_DEFS,
  RIGHT_DETAIL_COLUMN_DEFS,
  CENTER_TOP_DETAIL_COLUMN_DEFS,
  CENTER_BOTTOM_DETAIL_COLUMN_DEFS,
  LEFT_DETAIL_COLUMN_DEFS,
} from "./ShpmMgmtColumns";

export const MENU_CODE = "MENU_SHPM_MGMT";

export default function ShpmMgmt() {
  const model = useShpmMgmtModel(MENU_CODE);
  const ctrl = useShpmMgmtController({ model });

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
          columnDefs={MAIN_COLUMN_DEFS()}
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
            {...model.bind("lgst")}
            columnDefs={RIGHT_DETAIL_COLUMN_DEFS()}
            codeMap={model.codeMap}
            actions={ctrl.detail01Actions}
            onRowClicked={ctrl.onLgstRowClicked}
          />
          <SplitPane
            direction="vertical"
            defaultSizes={[50, 50]}
            minSizes={[25, 25]}
            handleThickness="1.5"
            storageKey={model.storageKeys.top}
          >
            <DataGrid
              {...model.bind("zone")}
              columnDefs={CENTER_TOP_DETAIL_COLUMN_DEFS()}
              codeMap={model.codeMap}
              actions={ctrl.detail01Actions}
              onRowClicked={ctrl.onZoneRowClicked}
              gridOptions={{
                defaultColDef: {
                  resizable: true,
                  sortable: true,
                  filter: false,
                  floatingFilter: false,
                },
              }}
            />
            <DataGrid
              {...model.bind("zoneCond")}
              columnDefs={CENTER_BOTTOM_DETAIL_COLUMN_DEFS()}
              codeMap={model.codeMap}
              actions={ctrl.detail01Actions}
              gridOptions={{
                defaultColDef: {
                  resizable: true,
                  sortable: true,
                  filter: false,
                  floatingFilter: false,
                },
              }}
            />
          </SplitPane>
          <DataGrid
            {...model.bind("rate")}
            columnDefs={LEFT_DETAIL_COLUMN_DEFS()}
            codeMap={model.codeMap}
            actions={ctrl.detail02Actions}
          />
        </SplitPane>
      }
    />
  );
}
