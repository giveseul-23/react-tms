"use client";

import { useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

import { useDepartArrivalManagementModel } from "./DepartArrivalManagementModel";
import { useDepartArrivalManagementController } from "./DepartArrivalManagementController";
import {
  MAIN_COLUMN_DEFS,
  STOPOVER_COLUMN_DEFS,
  ASSIGNED_ORDER_COLUMN_DEFS,
} from "./DepartArrivalManagementColumns";

const MENU_CD = "MENU_EVENT_MANAGER";

export default function DepartArrivalManagement() {
  const { meta, loading } = useSearchMeta(MENU_CD);
  const model = useDepartArrivalManagementModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const excludeKeysRef = useRef<Set<string>>(new Set());

  const ctrl = useDepartArrivalManagementController({
    model,
    searchRef,
    filtersRef,
  });

  if (loading) return <Skeleton className="h-24" />;

  return (
    <MasterDetailPage
      defaultSizes={[60, 40]}
      searchProps={{
        meta,
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.handleSearch,
        searchRef,
        filtersRef,
        pageSize: model.pageSize,
        excludeKeysRef,
      }}
      direction={model.layout === "side" ? "horizontal" : "vertical"}
      layoutToggle={{
        layout: model.layout,
        onToggle: () =>
          model.setLayout((prev: LayoutType) =>
            prev === "side" ? "vertical" : "side",
          ),
      }}
      storageKey="depart-arrival-management"
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
            { key: "STOPOVER", label: "경유처" },
            { key: "ASSIGNED_ORDER", label: "할당주문" },
          ]}
          presets={{
            STOPOVER: {
              columnDefs: STOPOVER_COLUMN_DEFS,
              actions: ctrl.stopoverActions,
            },
            ASSIGNED_ORDER: {
              columnDefs: ASSIGNED_ORDER_COLUMN_DEFS,
              actions: ctrl.assignedOrderActions,
            },
          }}
          rowData={{
            STOPOVER: model.stopoverRowData,
            ASSIGNED_ORDER: model.assignedOrderRowData,
          }}
          codeMap={model.codeMap}
          actions={[]}
        />
      }
    />
  );
}
