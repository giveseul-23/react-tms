"use client";

import { useMemo, useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";
import { useApplicationModel } from "./ApplicationModel";
import { useApplicationController } from "./ApplicationController";
import { MAIN_COLUMN_DEFS } from "./ApplicationColumns";

export const MENU_CD = "MENU_APPL";

export default function Application() {
  const { meta, loading } = useSearchMeta(MENU_CD);
  const model = useApplicationModel();
  const columnDefs = useMemo(
    () => MAIN_COLUMN_DEFS(model.setGridData),
    [model.setGridData],
  );

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});

  const ctrl = useApplicationController({
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
        fetchFn: ctrl.fetchApplicationList,
        onSearchCallback: ctrl.onSearchCallback,
        searchRef,
        filtersRef,
        pageSize: model.pageSize,
        menuCode: MENU_CD,
      }}
      grid={
        <DataGrid
          layoutType="plain"
          columnDefs={columnDefs}
          codeMap={model.codeMap}
          setRowData={model.setGridData}
          rowData={model.gridData.rows}
          totalCount={model.gridData.totalCount}
          currentPage={model.gridData.page}
          pageSize={model.pageSize}
          onPageSizeChange={model.setPageSize}
          onPageChange={(page) => {
            searchRef.current?.(page);
          }}
          actions={ctrl.mainActions}
        />
      }
    />
  );
}
