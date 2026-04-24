"use client";

import { useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";
import { useSearchCondition } from "@/hooks/useSearchCondition";
import { useCurrencyModel } from "./CurrencyModel.ts";
import { useCurrencyController } from "./CurrencyController";
import { MAIN_COLUMN_DEFS } from "./CurrencyColumns";
export const MENU_CD = "MENU_CURR_MGMT";

export default function Currency() {
  const { meta, loading } = useSearchMeta(MENU_CD);
  const model = useCurrencyModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const excludeKeysRef = useRef<Set<string>>(new Set());

  useSearchCondition({
    meta,
    excludeKeysRef,
    filtersRef,
    excludes: ["BOOKING"],
  });

  const ctrl = useCurrencyController({
    menuCd: MENU_CD,
    model,
    searchRef,
    filtersRef,
  });

  if (loading) return <Skeleton className="h-24" />;

  return (
    <GridOnlyPage
      searchProps={{
        meta,
        fetchFn: ctrl.fetchDispatchList,
        onSearch: ctrl.handleSearch,
        searchRef,
        filtersRef,
        pageSize: model.pageSize,
        excludeKeysRef,
        menuCode: MENU_CD,
      }}
      grid={
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
            searchRef.current?.(page, false);
          }}
          actions={ctrl.mainActions}
          onRowClicked={ctrl.handleRowClicked}
        />
      }
    />
  );
}
