"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";

import { useDepartArrivalManagementModel } from "./DepartArrivalManagementModel";
import { useDepartArrivalManagementController } from "./DepartArrivalManagementController";
import {
  MAIN_COLUMN_DEFS,
  STOPOVER_COLUMN_DEFS,
  ASSIGNED_ORDER_COLUMN_DEFS,
} from "./DepartArrivalManagementColumns";

export const MENU_CD = "MENU_EVENT_MANAGER";

export default function DepartArrivalManagement() {
  const model = useDepartArrivalManagementModel(MENU_CD);
  const ctrl = useDepartArrivalManagementController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CD}
      defaultSizes={[60, 40]}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.onSearchCallback,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
        menuCode: MENU_CD,
      }}
      direction={model.layout === "side" ? "horizontal" : "vertical"}
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
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
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
                  columnDefs={STOPOVER_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.stopoverActions}
                  audit={false}
                />
              ),
            },
            ASSIGNED_ORDER: {
              render: () => (
                <DataGrid
                  {...model.bind("assignedOrder")}
                  columnDefs={ASSIGNED_ORDER_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.assignedOrderActions}
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
