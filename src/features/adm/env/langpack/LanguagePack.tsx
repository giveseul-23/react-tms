"use client";

import { useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";
import { useSearchCondition } from "@/hooks/useSearchCondition";
import { useLanguagePackModel } from "./LanguagePackModel";
import { useLanguagePackController } from "./LanguagePackController";
import { MAIN_COLUMN_DEFS } from "./LanguagePackColumns";

export const MENU_CD = "MENU_LANG_PACK";

export default function LanguagePack() {
  const { meta, loading } = useSearchMeta(MENU_CD);
  const model = useLanguagePackModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const excludeKeysRef = useRef<Set<string>>(new Set());

  useSearchCondition({
    meta,
    excludeKeysRef,
    filtersRef,
  });

  const ctrl = useLanguagePackController({
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
        fetchFn: ctrl.fetchLanguagePackList,
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
          columnDefs={MAIN_COLUMN_DEFS(model.setGridData)}
          codeMap={model.codeMap}
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
