"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useStoppedVehicleControlModel } from "./StoppedVehicleControlModel";
import { useStoppedVehicleControlController } from "./StoppedVehicleControlController";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  SUB02_COLUMN_DEFS,
  SUB03_COLUMN_DEFS,
} from "./StoppedVehicleControlColumns";

export const MENU_CODE = "MENU_STOPPED_VEH_CTRL";

export default function StoppedVehicleControl() {
  const model = useStoppedVehicleControlModel(MENU_CODE);
  const ctrl = useStoppedVehicleControlController({ model });

  return (
    <GridOnlyPage
      menuCode={MENU_CODE}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      grid={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "STOPPED_VEH", label: "MENU_STOPPED_VEH_CTRL" },
            { key: "VEH", label: "LBL_BY_VEH_SRCH" },
          ]}
          presets={{
            STOPPED_VEH: {
              render: () => (
              <SplitPane
                direction="horizontal"
                defaultSizes={[50, 20, 30]}
                minSizes={[20, 15, 20]}
                storageKey="lgstSync-outer"
              >
                {/* 좌측 — 기준 / 운영조직별 */}                
                <SplitPane
                  direction="vertical"
                  defaultSizes={[55, 45]}
                  storageKey={model.storageKeys.top}
                >                
                  <DataGrid
                    {...model.bind("main")}
                    columnDefs={MAIN_COLUMN_DEFS}
                    headerCheckbox={false}
                    audit={false}
                    onRowClicked={ctrl.onMainGridClick}
                    actions={ctrl.mainActions}
                  />
                  <DataGrid
                    {...model.bind("sub01")}
                    columnDefs={SUB01_COLUMN_DEFS}
                    codeMap={model.codeMap}
                    headerCheckbox={false}
                    audit={false}
                    onRowClicked={ctrl.onSub01GridClick}
                    actions={ctrl.sub01Actions}
                    pagination={false}
                  />
                </SplitPane>

                <DataGrid
                  {...model.bind("sub02")}
                  columnDefs={SUB02_COLUMN_DEFS}
                  headerCheckbox={false}
                  audit={false}
                  actions={[]}
                  pagination={true}
                />
                </SplitPane>
              ),
            },
            VEH: {
              render: () => (
                <DataGrid
                  {...model.bind("sub03")}
                  columnDefs={SUB03_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.sub03Actions}
                  audit={false}
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
