"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SidePanel } from "@/app/components/layout/SidePanel";
import VehicleLocationPanel from "./panel/VehicleLocationPanel";
import DriveRoutePanel from "./panel/DriveRoutePanel";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";

import { useDispatchPlanModel } from "./DispatchPlanModel";
import { useDispatchPlanController } from "./DispatchPlanController";
import {
  MAIN_COLUMN_DEFS,
  STOP_COLUMN_DEFS,
  ALLOC_ORDER_COLUMN_DEFS,
  UNALLOC_ORDER_COLUMN_DEFS,
  ALLOC_ORDER_SUB_COLUMN_DEFS,
  UNALLOC_ORDER_SUB_COLUMN_DEFS,
} from "./DispatchPlanColumns";

export const MENU_CODE = "MENU_DISPATCH_PLAN_AD";

export default function DispatchPlan() {
  const model = useDispatchPlanModel(MENU_CODE);
  const ctrl = useDispatchPlanController({ model });

  return (
    <>
      <MasterDetailPage
        menuCode={MENU_CODE}
        searchProps={{
          moduleDefault: "TMS",
          fetchFn: ctrl.fetchDispatchPlanList,
          onSearchCallback: ctrl.onSearchCallback,
          ...model.bindSearch(),
          menuCode: MENU_CODE,
        }}
        direction={model.layout === "side" ? "horizontal" : "vertical"}
        defaultSizes={[55, 45]}
        layoutToggle={{
          layout: model.layout,
          onToggle: () =>
            model.setLayout((prev: LayoutType) =>
              prev === "side" ? "vertical" : "side",
            ),
        }}
        storageKey={model.storageKeys.outer}
        master={
          <DataGrid
            {...model.bind("main")}
            columnDefs={MAIN_COLUMN_DEFS}
            codeMap={model.codeMap}
            actions={ctrl.mainActions}
            onRowClicked={ctrl.onMainGridClick}
          />
        }
        detail={
          <DataGrid
            layoutType="tab"
            tabs={[
              { key: "STOP", label: "LBL_STOP" },
              { key: "ALLOC", label: "LBL_ASSIGNED_SHIPMENTS" },
              { key: "UNALLOC", label: "LBL_UNASSIGNED_SHIPMENTS" },
            ]}
            presets={{
              STOP: {
                render: () => (
                  <DataGrid
                    {...model.bind("stop")}
                    columnDefs={STOP_COLUMN_DEFS}
                    codeMap={model.codeMap}
                    actions={ctrl.stopActions}
                    audit={false}
                  />
                ),
              },
              ALLOC: {
                render: () => (
                  <SplitPane direction="horizontal" defaultSizes={[70, 30]}>
                    <DataGrid
                      {...model.bind("allocOrder")}
                      columnDefs={ALLOC_ORDER_COLUMN_DEFS}
                      codeMap={model.codeMap}
                      actions={ctrl.allocOrderActions}
                      onRowClicked={ctrl.onAllocOrderRowClicked}
                      audit={false}
                    />
                    <DataGrid
                      {...model.bind("allocSub")}
                      columnDefs={ALLOC_ORDER_SUB_COLUMN_DEFS}
                      actions={ctrl.allocSubActions}
                    />
                  </SplitPane>
                ),
              },
              UNALLOC: {
                render: () => (
                  <SplitPane direction="horizontal" defaultSizes={[70, 30]}>
                    <DataGrid
                      {...model.bind("unallocOrder")}
                      columnDefs={UNALLOC_ORDER_COLUMN_DEFS}
                      codeMap={model.codeMap}
                      actions={ctrl.unallocOrderActions}
                      onRowClicked={ctrl.onUnallocOrderRowClicked}
                      audit={false}
                    />
                    <DataGrid
                      {...model.bind("unallocSub")}
                      columnDefs={UNALLOC_ORDER_SUB_COLUMN_DEFS}
                      actions={ctrl.unallocSubActions}
                    />
                  </SplitPane>
                ),
              },
            }}
            actions={[]}
          />
        }
      />

      <SidePanel
        open={model.vehLocPanelOpen}
        onClose={() => model.setVehLocPanelOpen(false)}
        title="BTN_SHOW_VEHICLE_LOCATION"
        width={520}
      >
        <VehicleLocationPanel row={model.grids.main.selected} />
      </SidePanel>

      <SidePanel
        open={model.routePanelOpen}
        onClose={() => model.setRoutePanelOpen(false)}
        title="BTN_SHOW_ROUTE"
        width={520}
      >
        <DriveRoutePanel row={model.grids.main.selected} />
      </SidePanel>
    </>
  );
}
