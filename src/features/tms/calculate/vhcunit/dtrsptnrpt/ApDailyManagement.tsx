"use client";

import { useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

import { useApDailyManagementModel } from "./ApDailyManagementModel";
import { useApDailyManagementController } from "./ApDailyManagementController";
export const MENU_CODE = "MENU_AP_DAILY_MGMT";

export default function ApDailyManagement() {
  const { meta, loading } = useSearchMeta(MENU_CODE);
  const model = useApDailyManagementModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const rawFiltersRef = useRef<Record<string, string>>({});
  const excludeKeysRef = useRef<Set<string>>(new Set());

  const ctrl = useApDailyManagementController({
    model,
    searchRef,
    filtersRef,
    rawFiltersRef,
  });

  if (loading) return <Skeleton className="h-24" />;

  return (
    <GridOnlyPage
      searchProps={{
        meta,
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.handleSearch,
        searchRef,
        filtersRef,
        rawFiltersRef,
        pageSize: model.pageSize,
        excludeKeysRef,
        menuCode: MENU_CODE,
      }}
      grid={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "DAILY", label: "LBL_DAY_REPORT" },
            { key: "DETAIL", label: "LBL_DTL_DESC" },
          ]}
          presets={{
            DAILY: {
              columnDefs: model.mainColumnDefs,
              actions: ctrl.mainActions,
              onRowClicked: ctrl.handleRowClicked,
            },
            DETAIL: {
              columnDefs: model.detailColumnDefs,
              actions: ctrl.detailActions,
            },
          }}
          rowData={{
            DAILY: model.gridData.rows,
            DETAIL: model.detailRowData.rows,
          }}
          codeMap={model.codeMap}
          totalCount={model.gridData.totalCount}
          currentPage={model.gridData.page}
          pageSize={model.pageSize}
          onPageSizeChange={model.setPageSize}
          onPageChange={(page) => {
            model.resetSubGrids();
            searchRef.current?.(page);
          }}
          actions={[]}
        />
      }
    />
  );
}
