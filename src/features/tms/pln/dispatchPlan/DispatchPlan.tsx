"use client";

import { useRef } from "react";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
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

export const MENU_CODE = "MENU_DISPATCH_PLAN";

export default function DispatchPlan() {
  const model = useDispatchPlanModel(MENU_CODE);
  const rawFiltersRef = useRef<Record<string, string>>({});
  const ctrl = useDispatchPlanController({ model, rawFiltersRef });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchDispatchPlanList,
        onSearch: ctrl.handleSearch,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        rawFiltersRef,
        pageSize: model.pageSize,
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
          columnDefs={MAIN_COLUMN_DEFS()}
          codeMap={model.codeMap}
          actions={ctrl.mainActions}
          onRowClicked={ctrl.onMainGridClick}
          audit={false}
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
              columnDefs: STOP_COLUMN_DEFS(),
              actions: ctrl.stopActions,
            },
            ALLOC: {
              columnDefs: ALLOC_ORDER_COLUMN_DEFS(),
              actions: ctrl.allocOrderActions,
              onRowClicked: ctrl.onAllocOrderRowClicked,
            },
            UNALLOC: {
              columnDefs: UNALLOC_ORDER_COLUMN_DEFS(),
              actions: ctrl.unallocOrderActions,
              onRowClicked: ctrl.onUnallocOrderRowClicked,
            },
          }}
          rowData={{
            STOP: model.grids.stop.rows,
            ALLOC: model.grids.allocOrder.rows,
            UNALLOC: model.grids.unallocOrder.rows,
          }}
          actions={[]}
          renderRightGrid={(activeTabKey) => {
            if (activeTabKey === "ALLOC") {
              return (
                <DataGrid
                  layoutType="plain"
                  columnDefs={ALLOC_ORDER_SUB_COLUMN_DEFS()}
                  rowData={model.grids.allocSub.rows}
                  actions={ctrl.allocSubActions}
                />
              );
            }
            if (activeTabKey === "UNALLOC") {
              return (
                <DataGrid
                  layoutType="plain"
                  columnDefs={UNALLOC_ORDER_SUB_COLUMN_DEFS()}
                  rowData={model.grids.unallocSub.rows}
                  actions={ctrl.unallocSubActions}
                />
              );
            }
            return null;
          }}
        />
      }
    />
  );
}
