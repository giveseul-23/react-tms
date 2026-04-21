"use client";

import { useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

import { useIfDispatchResultModel } from "./IfDispatchResultModel";
import { useIfDispatchResultController } from "./IfDispatchResultController";
import { MAIN_COLUMN_DEFS } from "./IfDispatchResultColumns";

const MENU_CODE = "MENU_IF_SEND_DSPCH_RSLT";

export default function IfDispatchResult() {
  const { meta, loading } = useSearchMeta(MENU_CODE);
  const model = useIfDispatchResultModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const excludeKeysRef = useRef<Set<string>>(new Set());

  const ctrl = useIfDispatchResultController({
    model,
    searchRef,
    filtersRef,
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
        pageSize: model.pageSize,
        excludeKeysRef,
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
          onPageChange={(page) => searchRef.current?.(page)}
          onRowClicked={ctrl.handleRowClicked}
          actions={ctrl.mainActions}
        />
      }
    />
  );
}
