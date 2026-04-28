"use client";

import { useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

import { useDispatchPlanModel } from "./DispatchPlanModel.ts";
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
  const { meta, loading } = useSearchMeta(MENU_CODE);
  const model = useDispatchPlanModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const rawFiltersRef = useRef<Record<string, string>>({});

  const ctrl = useDispatchPlanController({
    model,
    searchRef,
    filtersRef,
    rawFiltersRef,
  });

  if (loading) return <Skeleton className="h-24" />;

  return (
    <MasterDetailPage
      searchProps={{
        meta,
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchDispatchPlanList,
        onSearch: ctrl.handleSearch,
        searchRef,
        filtersRef,
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
      storageKey="dispatch-plan-master-detail"
      master={
        <DataGrid
          layoutType="plain"
          columnDefs={MAIN_COLUMN_DEFS()}
          codeMap={model.codeMap}
          rowData={model.gridData.rows}
          totalCount={model.gridData.totalCount}
          currentPage={model.gridData.page}
          pageSize={model.pageSize}
          onPageSizeChange={model.setPageSize}
          onPageChange={(page) => {
            model.resetSubGrids();
            searchRef.current?.(page, false);
          }}
          actions={ctrl.mainActions}
          onRowClicked={ctrl.handleRowClicked}
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
              onRowClicked: ctrl.handleAllocOrderRowClicked,
            },
            UNALLOC: {
              columnDefs: UNALLOC_ORDER_COLUMN_DEFS(),
              actions: ctrl.unallocOrderActions,
              onRowClicked: ctrl.handleUnallocOrderRowClicked,
            },
          }}
          rowData={{
            STOP: model.stopRowData,
            ALLOC: model.allocOrderRowData,
            UNALLOC: model.unallocOrderRowData,
          }}
          actions={[]}
          renderRightGrid={(activeTabKey) => {
            if (activeTabKey === "ALLOC") {
              return (
                <DataGrid
                  layoutType="plain"
                  columnDefs={ALLOC_ORDER_SUB_COLUMN_DEFS()}
                  rowData={model.allocSubRowData}
                  actions={ctrl.allocSubActions}
                />
              );
            }
            if (activeTabKey === "UNALLOC") {
              return (
                <DataGrid
                  layoutType="plain"
                  columnDefs={UNALLOC_ORDER_SUB_COLUMN_DEFS()}
                  rowData={model.unallocSubRowData}
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
