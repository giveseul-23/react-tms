"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import DataGrid from "@/app/components/grid/DataGrid";

import { useDepartArrivalManagementModel } from "./DepartArrivalManagementModel";
import { useDepartArrivalManagementController } from "./DepartArrivalManagementController";
import {
  MAIN_COLUMN_DEFS,
  STOPOVER_COLUMN_DEFS,
  ASSIGNED_ORDER_COLUMN_DEFS,
  SHIPMENT_DETAIL_COLUMN_DEFS,
} from "./DepartArrivalManagementColumns";

export const MENU_CD = "MENU_EVENT_MANAGER";

export const AUTH = {
  grids: {
    main: "MAIN_GRID_EVENT_MANAGER",
    stopover: "SUB01_GRID_EVENT_MANAGER",
    assignedOrder: "SUB02_GRID_ARR_DEP",
    shipmentDetail: "SUB03_GRID_ARR_DEP",
  },
};

export default function DepartArrivalManagement() {
  const model = useDepartArrivalManagementModel(MENU_CD);
  const ctrl = useDepartArrivalManagementController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CD}
      defaultSizes={[75, 25]}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
        excludes: [
          {
            column: "DLVRY_DT",
            as: { FROM: "DLVRY_DT_FROM", TO: "DLVRY_DT_TO" },
          },
        ],
      }}
      defaultDirection="vertical"
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
          authId={AUTH.grids.main}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          rowSelection="multiple"
          audit={false}
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "STOPOVER", label: "LBL_STOP" },
            { key: "ASSIGNED_ORDER", label: "LBL_ASSIGNED_SHIPMENTS" },
          ]}
          presets={{
            STOPOVER: {
              render: () => (
                <DataGrid
                  {...model.bind("stopover")}
                  {...ctrl.stopoverPageProps}
                  authId={AUTH.grids.stopover}
                  columnDefs={STOPOVER_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.stopoverActions}
                  gridOptions={{
                    onCellClicked: ctrl.onStopoverCellClicked,
                  }}
                  audit={false}
                />
              ),
            },
            ASSIGNED_ORDER: {
              render: () => (
                <SplitPane
                  direction="horizontal"
                  defaultSizes={[60, 40]}
                  storageKey={model.storageKeys.bottom}
                >
                  <DataGrid
                    {...model.bind("assignedOrder")}
                    {...ctrl.assignedOrderPageProps}
                    authId={AUTH.grids.assignedOrder}
                    columnDefs={ASSIGNED_ORDER_COLUMN_DEFS}
                    codeMap={model.codeMap}
                    onRowClicked={ctrl.onAssignedOrderGridClick}
                    actions={ctrl.assignedOrderActions}
                    audit={false}
                  />
                  <DataGrid
                    {...model.bind("shipmentDetail")}
                    {...ctrl.shipmentDetailPageProps}
                    authId={AUTH.grids.shipmentDetail}
                    columnDefs={SHIPMENT_DETAIL_COLUMN_DEFS}
                    codeMap={model.codeMap}
                    actions={[]}
                    audit={false}
                  />
                </SplitPane>
              ),
            },
          }}
          actions={[]}
        />
      }
    />
  );
}
