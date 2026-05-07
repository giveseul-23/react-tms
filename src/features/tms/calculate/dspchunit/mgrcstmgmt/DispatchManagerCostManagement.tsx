"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";

import { useDispatchManagerCostModel } from "./DispatchManagerCostManagementModel";
import { useDispatchManagerCostController } from "./DispatchManagerCostManagementController";
import {
  MAIN_COLUMN_DEFS,
  COST_DETAIL_COLUMN_DEFS,
  WAYPOINT_COLUMN_DEFS,
} from "./DispatchManagerCostManagementColumns";

export const MENU_CODE = "MENU_DSPCH_AP_APPROVAL_AND_CLOSING";

export default function DispatchManagerCostManagement() {
  const model = useDispatchManagerCostModel(MENU_CODE);
  const ctrl = useDispatchManagerCostController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[55, 45]}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.handleSearch,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
        menuCode: MENU_CODE,
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
            { key: "COST", label: "LBL_RATE_INFO" },
            { key: "WAYPOINT", label: "LBL_STOP" },
          ]}
          presets={{
            COST: {
              columnDefs: COST_DETAIL_COLUMN_DEFS,
              actions: ctrl.costDetailActions,
            },
            WAYPOINT: {
              columnDefs: WAYPOINT_COLUMN_DEFS,
              actions: ctrl.waypointActions,
            },
          }}
          rowData={{
            COST: model.grids.costDetail.rows,
            WAYPOINT: model.grids.waypoint.rows,
          }}
          codeMap={model.codeMap}
          actions={[]}
        />
      }
    />
  );
}
