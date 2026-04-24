"use client";

import { useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

import { useDispatchManagerCostModel } from "./DispatchManagerCostManagementModel";
import { useDispatchManagerCostController } from "./DispatchManagerCostManagementController";
import {
  MAIN_COLUMN_DEFS,
  COST_DETAIL_COLUMN_DEFS,
  WAYPOINT_COLUMN_DEFS,
} from "./DispatchManagerCostManagementColumns";
export const MENU_CODE = "MENU_DSPCH_AP_APPROVAL_AND_CLOSING";

export default function DispatchManagerCostManagement() {
  const { meta, loading } = useSearchMeta(MENU_CODE);
  const model = useDispatchManagerCostModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const excludeKeysRef = useRef<Set<string>>(new Set());

  const ctrl = useDispatchManagerCostController({
    model,
    searchRef,
    filtersRef,
  });

  if (loading) return <Skeleton className="h-24" />;

  return (
    <MasterDetailPage
      defaultSizes={[55, 45]}
      searchProps={{
        meta,
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.handleSearch,
        searchRef,
        filtersRef,
        pageSize: model.pageSize,
        excludeKeysRef,
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
      storageKey="dispatch-manager-cost-management"
      master={
        <DataGrid
          layoutType="plain"
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          rowData={model.gridData.rows}
          totalCount={model.gridData.totalCount}
          currentPage={model.gridData.page}
          pageSize={model.pageSize}
          onPageSizeChange={model.setPageSize}
          onPageChange={(page) => {
            model.resetSubGrids();
            searchRef.current?.(page);
          }}
          onRowClicked={ctrl.handleRowClicked}
          actions={ctrl.mainActions}
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "COST", label: "비용상세정보" },
            { key: "WAYPOINT", label: "경유처" },
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
            COST: model.costDetailRowData,
            WAYPOINT: model.waypointRowData,
          }}
          codeMap={model.codeMap}
          actions={[]}
        />
      }
    />
  );
}
