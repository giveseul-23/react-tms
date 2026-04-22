"use client";

import { useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

import { useApMonthlyManagementModel } from "./ApMonthlyManagementModel";
import { useApMonthlyManagementController } from "./ApMonthlyManagementController";

const MENU_CODE = "MENU_AP_MONTHLY_MGMT";

export default function ApMonthlyManagement() {
  const { meta, loading } = useSearchMeta(MENU_CODE);
  const model = useApMonthlyManagementModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const rawFiltersRef = useRef<Record<string, string>>({});
  const excludeKeysRef = useRef<Set<string>>(new Set());

  const ctrl = useApMonthlyManagementController({
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
      }}
      grid={
        <DataGrid
          layoutType="plain"
          columnDefs={model.mainColumnDefs}
          codeMap={model.codeMap}
          rowData={model.gridData.rows}
          totalCount={model.gridData.totalCount}
          currentPage={model.gridData.page}
          pageSize={model.pageSize}
          onPageSizeChange={model.setPageSize}
          onPageChange={(page) => searchRef.current?.(page)}
          actions={ctrl.mainActions}
          onRowClicked={ctrl.handleRowClicked}
        />
      }
    />
  );
}
